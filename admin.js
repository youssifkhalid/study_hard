$(document).ready(() => {
  const educationalData = JSON.parse(localStorage.getItem("educationalData")) || []

  function displayContent() {
    const contentCards = $("#contentCards")
    contentCards.empty()

    educationalData.forEach((item, index) => {
      const card = `
        <div class="col-md-4 mb-4">
          <div class="card animate__animated animate__fadeIn">
            <img src="${item.teacherImage}" class="card-img-top teacher-image mt-3" alt="${item.teacherName}">
            <div class="card-body">
              <h5 class="card-title">${item.subject}</h5>
              <p class="card-text">${item.teacherName}</p>
              <p class="card-text">الصف: ${item.grade} - الترم: ${item.term}</p>
              <p class="card-text">معرف القائمة: ${item.playlistId}</p>
              <div class="d-flex justify-content-between">
                <button class="btn btn-primary btn-sm edit-btn" data-id="${index}">
                  <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${index}">
                  <i class="fas fa-trash-alt"></i> حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      `
      contentCards.append(card)
    })
  }

  displayContent()

  $("#teacherImage").on("input", function () {
    const imageUrl = $(this).val()
    if (imageUrl) {
      $("#imagePreview").attr("src", imageUrl).show()
    } else {
      $("#imagePreview").hide()
    }
  })

  $("#saveContent").click(() => {
    const contentId = $("#contentId").val()
    const formData = {
      grade: $("#grade").val(),
      term: $("#term").val(),
      subject: $("#subject").val(),
      teacherName: $("#teacherName").val(),
      playlistId: $("#playlistId").val(),
      teacherImage: $("#teacherImage").val(),
    }

    if (contentId === "") {
      educationalData.push(formData)
    } else {
      educationalData[Number.parseInt(contentId)] = formData
    }

    localStorage.setItem("educationalData", JSON.stringify(educationalData))
    $("#addContentModal").modal("hide")
    displayContent()
    Swal.fire({
      icon: "success",
      title: "تم الحفظ بنجاح",
      showConfirmButton: false,
      timer: 1500,
    })
  })

  $(document).on("click", ".edit-btn", function () {
    const id = $(this).data("id")
    const item = educationalData[id]
    $("#contentId").val(id)
    $("#grade").val(item.grade)
    $("#term").val(item.term)
    $("#subject").val(item.subject)
    $("#teacherName").val(item.teacherName)
    $("#playlistId").val(item.playlistId)
    $("#teacherImage").val(item.teacherImage)
    $("#imagePreview").attr("src", item.teacherImage).show()
    $("#modalTitle").text("تعديل المحتوى")
    $("#addContentModal").modal("show")
  })

  $(document).on("click", ".delete-btn", function () {
    const id = $(this).data("id")
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed) {
        educationalData.splice(id, 1)
        localStorage.setItem("educationalData", JSON.stringify(educationalData))
        displayContent()
        Swal.fire("تم الحذف!", "تم حذف المحتوى بنجاح.", "success")
      }
    })
  })

  $("#downloadJSON").click(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(educationalData, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "educational_data.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  })

  $("#addContentModal").on("hidden.bs.modal", () => {
    $("#contentForm")[0].reset()
    $("#imagePreview").hide()
    $("#contentId").val("")
    $("#modalTitle").text("إضافة محتوى جديد")
  })
})

