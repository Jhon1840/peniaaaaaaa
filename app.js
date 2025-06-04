// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Referencias a elementos del DOM
  const loginDiv = document.getElementById("login")
  const dashboardDiv = document.getElementById("dashboard")
  const doctorName = document.getElementById("doctorName")
  const formularios = document.getElementById("formularios")
  const conclusionDiv = document.getElementById("conclusion")
  const hipotesisTextarea = document.getElementById("hipotesis")
  const loadingOverlay = document.getElementById("loadingOverlay")

  // Fecha actual para el campo de fecha
  const fechaActual = new Date().toISOString().split("T")[0]
  document.getElementById("fechaInforme").value = fechaActual

  // Usuarios válidos para el login
  const usuariosValidos = {
    drperez: "1234",
    "dra.garcia": "abcd",
    admin: "admin123",
  }

  // Variables de estado
  let formularioActual = null
  let tipoExamenSeleccionado = null

  // Event Listeners
  document.getElementById("loginBtn").addEventListener("click", login)
  document.getElementById("logoutBtn").addEventListener("click", logout)
  document.getElementById("generarPDFBtn").addEventListener("click", generarPDF)

  // Event listeners para selección de examen
  document.querySelectorAll(".exam-option").forEach((option) => {
    option.addEventListener("click", () => seleccionarExamen(option))
  })

  // Función de login
  function login() {
    const username = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value

    if (usuariosValidos[username] && usuariosValidos[username] === password) {
      doctorName.textContent = username
      loginDiv.classList.add("hidden")
      dashboardDiv.classList.remove("hidden")

      // Animación suave
      setTimeout(() => {
        dashboardDiv.style.opacity = "1"
      }, 100)
    } else {
      mostrarNotificacion("Usuario o contraseña incorrectos", "error")
    }
  }

  // Función de logout
  function logout() {
    loginDiv.classList.remove("hidden")
    dashboardDiv.classList.add("hidden")
    formularios.classList.add("hidden")
    conclusionDiv.classList.add("hidden")

    // Limpiar formularios
    document.getElementById("username").value = ""
    document.getElementById("password").value = ""
    tipoExamenSeleccionado = null
    formularioActual = null

    // Resetear botones
    document.getElementById("generarPDFBtn").disabled = true

    // Quitar selección de exámenes
    document.querySelectorAll(".exam-option").forEach((option) => {
      option.classList.remove("selected")
    })
  }

  // Función para seleccionar examen
  function seleccionarExamen(option) {
    // Validar datos del paciente
    const paciente = document.getElementById("pacienteNombre").value.trim()
    const edad = document.getElementById("pacienteEdad").value.trim()

    if (!paciente || !edad) {
      mostrarNotificacion("Por favor, complete los datos del paciente", "warning")
      return
    }

    // Quitar selección anterior
    document.querySelectorAll(".exam-option").forEach((opt) => {
      opt.classList.remove("selected")
    })

    // Agregar selección actual
    option.classList.add("selected")
    tipoExamenSeleccionado = option.dataset.type

    // Mostrar el formulario automáticamente
    mostrarFormulario()
  }

  // Función para mostrar el formulario seleccionado
  function mostrarFormulario() {
    if (!tipoExamenSeleccionado) {
      mostrarNotificacion("Por favor, seleccione un tipo de examen", "warning")
      return
    }

    // Ocultar todos los formularios
    const todosFormularios = document.querySelectorAll(".form-exam")
    todosFormularios.forEach((form) => form.classList.add("hidden"))

    // Mostrar el formulario seleccionado
    const formularioId = `form-${tipoExamenSeleccionado}`
    const formulario = document.getElementById(formularioId)

    if (formulario) {
      formulario.classList.remove("hidden")
      formularioActual = tipoExamenSeleccionado
      conclusionDiv.classList.remove("hidden")

      // Habilitar botón de generar PDF
      document.getElementById("generarPDFBtn").disabled = false

      // Scroll hacia el formulario con animación suave
      setTimeout(() => {
        formulario.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)

      mostrarNotificacion("Formulario cargado correctamente", "success")
    }
  }

  // Función para generar el PDF
  async function generarPDF() {
    if (!formularioActual) {
      mostrarNotificacion("Debe seleccionar y mostrar un formulario antes de generar el PDF", "error")
      return
    }

    // Mostrar loading
    loadingOverlay.classList.remove("hidden")

    try {
      // Obtener datos del paciente
      const paciente = document.getElementById("pacienteNombre").value.trim()
      const edad = document.getElementById("pacienteEdad").value.trim()
      const sexo = document.getElementById("pacienteSexo").value
      const fecha = formatearFecha(document.getElementById("fechaInforme").value)
      const doctor = doctorName.textContent
      const institucion = document.getElementById("institucion").value.trim()
      const hipotesis = hipotesisTextarea.value.trim()

      // Simular tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Crear el PDF
      const { jsPDF } = window.jspdf
      const doc = new jsPDF()

      // Configuración de fuentes y encabezado
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)

      // Encabezado del informe
      doc.text(institucion, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" })

      doc.setFontSize(11)
      const tipoInformeTexto = obtenerTituloInforme(formularioActual)
      doc.text(`INFORME ECOGRÁFICO: ${tipoInformeTexto}`, doc.internal.pageSize.getWidth() / 2, 30, {
        align: "center",
      })

      // Información del paciente en formato de tabla
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      // Líneas de la tabla de datos del paciente
      const tableY = 40
      doc.rect(15, tableY, 180, 25) // Marco principal

      // Fila 1: Nombre
      doc.rect(15, tableY, 180, 8)
      doc.setFont("helvetica", "bold")
      doc.text("NOMBRE Y APELLIDOS:", 17, tableY + 5)
      doc.setFont("helvetica", "normal")
      doc.text(paciente, 70, tableY + 5)

      // Fila 2: Sexo y Edad
      doc.rect(15, tableY + 8, 90, 8)
      doc.rect(105, tableY + 8, 90, 8)
      doc.setFont("helvetica", "bold")
      doc.text("SEXO:", 17, tableY + 13)
      doc.text("EDAD:", 107, tableY + 13)
      doc.setFont("helvetica", "normal")
      doc.text(sexo, 35, tableY + 13)
      doc.text(`${edad} AÑOS`, 125, tableY + 13)

      // Fila 3: Fecha
      doc.rect(15, tableY + 16, 180, 9)
      doc.setFont("helvetica", "bold")
      doc.text("FECHA DE INFORME:", 17, tableY + 21)
      doc.setFont("helvetica", "normal")
      doc.text(fecha, 70, tableY + 21)

      // Título para el examen
      doc.rect(15, tableY + 30, 180, 8)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("EL EXAMEN ECOGRÁFICO ACTUAL MUESTRA:", 17, tableY + 35)

      // Contenido del formulario
      let yPos = tableY + 45
      yPos = agregarContenidoFormulario(doc, formularioActual, yPos)

      // Agregar hipótesis/conclusión
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.rect(10, yPos, 190, 20)
      doc.setFont("helvetica", "bold")
      doc.text("HIPÓTESIS:", 12, yPos + 6)
      doc.setFont("helvetica", "normal")

      const hipotesisTexto = hipotesis || obtenerHipotesisDefault(formularioActual)
      const lineasHipotesis = doc.splitTextToSize(hipotesisTexto, 170)
      doc.text(lineasHipotesis, 12, yPos + 12)

      // Agregar espacio para firma
      yPos += 40
      doc.text("FIRMA Y SELLO", doc.internal.pageSize.getWidth() / 2, yPos, { align: "center" })
      doc.text("MÉDICO ULTRASONOGRAFISTA", doc.internal.pageSize.getWidth() / 2, yPos + 10, {
        align: "center",
      })

      // Guardar el PDF
      doc.save(`${paciente || "reporte"}_${tipoInformeTexto.replace(/\s+/g, "_")}.pdf`)

      mostrarNotificacion("PDF generado exitosamente", "success")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      mostrarNotificacion("Error al generar el PDF", "error")
    } finally {
      // Ocultar loading
      loadingOverlay.classList.add("hidden")
    }
  }

  // Función para mostrar notificaciones
  function mostrarNotificacion(mensaje, tipo = "info") {
    // Crear elemento de notificación
    const notificacion = document.createElement("div")
    notificacion.className = `notification notification-${tipo}`
    notificacion.innerHTML = `
      <i class="fas ${getIconoNotificacion(tipo)}"></i>
      <span>${mensaje}</span>
    `

    // Agregar estilos
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${getColorNotificacion(tipo)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
    `

    // Agregar al DOM
    document.body.appendChild(notificacion)

    // Remover después de 4 segundos
    setTimeout(() => {
      notificacion.style.animation = "slideOut 0.3s ease-out"
      setTimeout(() => {
        if (notificacion.parentNode) {
          notificacion.parentNode.removeChild(notificacion)
        }
      }, 300)
    }, 4000)
  }

  function getIconoNotificacion(tipo) {
    const iconos = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }
    return iconos[tipo] || iconos.info
  }

  function getColorNotificacion(tipo) {
    const colores = {
      success: "#059669",
      error: "#dc2626",
      warning: "#d97706",
      info: "#2563eb",
    }
    return colores[tipo] || colores.info
  }

  // Función para obtener el título del informe
  function obtenerTituloInforme(tipo) {
    const titulos = {
      abdominal: "ECOGRAFÍA ABDOMINAL",
      "obstetrica-2do-3er": "ECOGRAFÍA OBSTÉTRICA 2DO Y 3ER TRIMESTRE",
      "obstetrica-1er": "ECOGRAFÍA OBSTÉTRICA 1ER TRIMESTRE",
      ginecologica: "ECOGRAFÍA GINECOLÓGICA",
    }
    return titulos[tipo] || "ECOGRAFÍA"
  }

  // Función para obtener hipótesis por defecto
  function obtenerHipotesisDefault(tipo) {
    const hipotesis = {
      abdominal: "DENTRO DE PARÁMETROS NORMALES",
      "obstetrica-2do-3er":
        "GESTACIÓN INTRAUTERINA ÚNICA\nFETO ÚNICO VIVO\nACTIVIDAD CARDÍACA PRESENTE\nGESTACIÓN DE APROXIMADAMENTE 15.4 SEMANAS POR FETOMETRÍA NORMAL",
      "obstetrica-1er": "1. Gestación intrauterina única\n2. Se sugiere ecografía de control en 4 semanas",
      ginecologica: "ECOGRAFÍA GINECOLÓGICA NORMAL",
    }
    return hipotesis[tipo] || "ECOGRAFÍA NORMAL"
  }

  // Función para agregar contenido del formulario al PDF
  function agregarContenidoFormulario(doc, tipo, yPos) {
    const formulario = document.getElementById(`form-${tipo}`)
    const secciones = formulario.querySelectorAll(".section-card")

    secciones.forEach((seccion) => {
      const titulo = seccion.querySelector("h3").textContent.trim()
      const campos = seccion.querySelectorAll(".field-group")

      // Verificar si necesitamos una nueva página
      if (yPos > 230) {
        doc.addPage()
        yPos = 20
      }

      // Título de la sección
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text(titulo, 12, yPos)
      yPos += 8

      // Procesar campos de la sección
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      campos.forEach((campo) => {
        const label = campo.querySelector("label")
        if (label && !label.textContent.includes("OBSERVACIÓN")) {
          const labelText = label.textContent.trim()
          let valorTexto = ""

          // Obtener valores de inputs directos
          const inputsDirectos = campo.querySelectorAll("input:not(.input-small)")
          inputsDirectos.forEach((input) => {
            if (input.value.trim() && !input.closest("span")) {
              valorTexto += input.value.trim() + " "
            }
          })

          // Procesar spans con inputs pequeños
          const spans = campo.querySelectorAll("span")
          spans.forEach((span) => {
            let spanTexto = span.textContent
            const spanInputs = span.querySelectorAll("input")

            spanInputs.forEach((input) => {
              if (input.value.trim()) {
                // Reemplazar el placeholder del input con su valor
                const inputPattern = new RegExp(input.outerHTML.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
                spanTexto = spanTexto.replace(inputPattern, input.value.trim())
              } else {
                // Si no hay valor, remover el input del texto
                const inputPattern = new RegExp(input.outerHTML.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
                spanTexto = spanTexto.replace(inputPattern, "___")
              }
            })

            // Limpiar texto duplicado y espacios extra
            spanTexto = spanTexto.replace(/\s+/g, " ").trim()
            if (spanTexto && spanTexto !== span.textContent) {
              valorTexto += spanTexto + " "
            }
          })

          // Construir línea final
          const lineaCompleta = `• ${labelText}: ${valorTexto.trim()}`

          // Verificar espacio disponible
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }

          // Dividir texto si es muy largo
          const lineasTexto = doc.splitTextToSize(lineaCompleta, 180)
          doc.text(lineasTexto, 15, yPos)
          yPos += lineasTexto.length * 4
        }
      })

      // Agregar observación al final de cada sección
      const observacionCampo = Array.from(campos).find((campo) => {
        const label = campo.querySelector("label")
        return label && label.textContent.includes("OBSERVACIÓN")
      })

      if (observacionCampo) {
        const observacionInput = observacionCampo.querySelector("input")
        const observacionTexto = `OBSERVACIÓN: ${observacionInput.value || "Ninguna"}`

        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        doc.setFont("helvetica", "italic")
        doc.text(observacionTexto, 15, yPos)
        doc.setFont("helvetica", "normal")
        yPos += 6
      }

      yPos += 5 // Espacio entre secciones
    })

    return yPos
  }

  // Función para formatear la fecha
  function formatearFecha(fechaStr) {
    if (!fechaStr) return ""

    const fecha = new Date(fechaStr)
    const dia = fecha.getDate().toString().padStart(2, "0")
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0")
    const anio = fecha.getFullYear()

    return `${dia}/${mes}/${anio}`
  }

  // Agregar estilos para animaciones de notificaciones
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
})
