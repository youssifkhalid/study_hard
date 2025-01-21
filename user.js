let player
let currentPlaylist
let currentSubject
let videoProgress = {}

const API_KEY = "AIzaSyA7TYBY-o0aIhZbZuzn_WJAjNht0F4YGH0" // استبدل هذا بمفتاح API الخاص بك

function onYouTubeIframeAPIReady() {
  // سيتم استدعاء هذه الدالة عندما تكون YouTube API جاهزة
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  })
}

$(document).ready(() => {
  const educationalData = JSON.parse(localStorage.getItem("educationalData")) || []
  let userPreferences = JSON.parse(localStorage.getItem("userPreferences")) || null

  function displayContent(grade, term) {
    const filteredData = educationalData.filter((item) => item.grade === grade && item.term === term)
    const subjectCards = $("#subjectCards")
    subjectCards.empty()

    filteredData.forEach((item, index) => {
      const card = `
        <div class="col-md-4 mb-4">
          <div class="card animate__animated animate__fadeIn">
            <div class="card-body text-center">
              <i class="fas fa-book subject-icon"></i>
              <h5 class="card-title">${item.subject}</h5>
              <img src="${item.teacherImage}" class="card-img-top teacher-image mt-3 mb-3" alt="${item.teacherName}">
              <p class="card-text">${item.teacherName}</p>
              <button class="btn btn-primary watch-playlist" data-playlist="${item.playlistId}" data-subject="${item.subject}">
                <i class="fas fa-play-circle"></i> شاهد الدروس
              </button>
            </div>
          </div>
        </div>
      `
      subjectCards.append(card)
    })
  }

  function onPlayerReady(event) {
    // يمكنك إضافة أي منطق تهيئة هنا
  }

  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
      const videoId = player.getVideoData().video_id
      markVideoAsWatched(videoId)
    }
  }

  function markVideoAsWatched(videoId) {
    if (!videoProgress[currentSubject]) {
      videoProgress[currentSubject] = {}
    }
    videoProgress[currentSubject][videoId] = true
    updateVideoCheckbox(videoId)
    saveVideoProgress()
  }

  function updateVideoCheckbox(videoId) {
    $(`#checkbox-${videoId}`).prop("checked", true)
  }

  function saveVideoProgress() {
    localStorage.setItem("videoProgress", JSON.stringify(videoProgress))
  }

  function loadVideoProgress() {
    const savedProgress = localStorage.getItem("videoProgress")
    if (savedProgress) {
      videoProgress = JSON.parse(savedProgress)
    }
  }

  $(document).on("click", ".watch-playlist", function () {
    const playlistId = $(this).data("playlist")
    currentSubject = $(this).data("subject")
    $("#currentSubject").text(currentSubject)
    $("#videoPlayer").show()
    loadPlaylist(playlistId)
  })

  function loadPlaylist(playlistId) {
    $.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      part: "snippet",
      maxResults: 50,
      playlistId: playlistId,
      key: API_KEY,
    }).done((data) => {
      const playlistDiv = $("#playlist")
      playlistDiv.empty()
      data.items.forEach((item, index) => {
        const videoId = item.snippet.resourceId.videoId
        const title = item.snippet.title
        const isWatched = videoProgress[currentSubject] && videoProgress[currentSubject][videoId]
        const listItem = `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="checkbox-${videoId}" ${isWatched ? "checked" : ""}>
            <label class="form-check-label" for="checkbox-${videoId}">
              <a href="#" class="play-video" data-video-id="${videoId}">${title}</a>
            </label>
          </div>
        `
        playlistDiv.append(listItem)
      })
      if (data.items.length > 0) {
        player.loadVideoById(data.items[0].snippet.resourceId.videoId)
      }
    })
  }

  $(document).on("click", ".play-video", function (e) {
    e.preventDefault()
    const videoId = $(this).data("video-id")
    player.loadVideoById(videoId)
  })

  function showContent() {
    $("#loginForm").hide()
    $("#contentArea").show()
    $("#logoutLink").show()
  }

  function showLoginForm() {
    $("#loginForm").show()
    $("#contentArea").hide()
    $("#logoutLink").hide()
  }

  loadVideoProgress()

  if (userPreferences) {
    displayContent(userPreferences.grade, userPreferences.term)
    showContent()
  } else {
    showLoginForm()
  }

  $("#userLoginForm").submit(function (e) {
    e.preventDefault()
    if (this.checkValidity() === false) {
      e.stopPropagation()
      $(this).addClass("was-validated")
      return
    }

    const grade = $("#userGrade").val()
    const term = $("#userTerm").val()

    userPreferences = { grade, term }
    localStorage.setItem("userPreferences", JSON.stringify(userPreferences))

    displayContent(grade, term)
    showContent()

    Swal.fire({
      icon: "success",
      title: "تم تسجيل الدخول بنجاح",
      text: `مرحبًا بك في الصف ${grade} - الترم ${term}`,
      showConfirmButton: false,
      timer: 1500,
    })
  })

  $("#logoutLink").click((e) => {
    e.preventDefault()
    localStorage.removeItem("userPreferences")
    showLoginForm()
    Swal.fire({
      icon: "info",
      title: "تم تسجيل الخروج",
      showConfirmButton: false,
      timer: 1500,
    })
  })
})

