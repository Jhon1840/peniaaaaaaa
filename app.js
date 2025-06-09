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
  let contadorFetos = 1 // Contador para fetos adicionales

  // Event Listeners
  document.getElementById("loginBtn").addEventListener("click", login)
  document.getElementById("logoutBtn").addEventListener("click", logout)
  document.getElementById("generarPDFBtn").addEventListener("click", generarPDF)

  // Event listeners para selección de examen
  document.querySelectorAll(".exam-option").forEach((option) => {
    option.addEventListener("click", () => seleccionarExamen(option))
  })

  // Event listeners para botones de eliminar sección
  document.querySelectorAll(".remove-section").forEach((btn) => {
    btn.addEventListener("click", function () {
      const sectionCard = this.closest(".section-card")
      if (sectionCard) {
        sectionCard.classList.add("hidden")
      }
    })
  })

  // Event listeners para botones de agregar feto
  document.querySelectorAll(".add-feto").forEach((btn) => {
    btn.addEventListener("click", agregarNuevoFeto)
  })

  // Función para agregar un nuevo feto
  function agregarNuevoFeto() {
    contadorFetos++
    const tipoFormulario = formularioActual

    if (tipoFormulario === "obstetrica-1er" || tipoFormulario === "obstetrica-2do-3er") {
      const formContent = document.querySelector(`#form-${tipoFormulario} .form-content`)

      // Crear nueva sección para el feto
      const nuevoFetoSection = document.createElement("div")
      nuevoFetoSection.className = "section-card feto-adicional"

      // Contenido diferente según el tipo de formulario
      if (tipoFormulario === "obstetrica-1er") {
        nuevoFetoSection.innerHTML = `
          <div class="section-header">
            <h3><i class="fas fa-baby"></i> FETO ${contadorFetos} <button type="button" class="remove-section"><i class="fas fa-trash"></i></button></h3>
          </div>
          <div class="section-body">
            <div class="field-group">
              <label>Diámetro céfalo-caudal (CRL):</label>
              <span class="input-with-unit">
                <span>midiendo: <input type="text" name="crl_medida_feto${contadorFetos}" class="input-small" value=""> mm.
                Edad Gestacional: <input type="text" name="crl_eg_feto${contadorFetos}" class="input-small" value=""> semanas.</span>
              </span>
            </div>
            <div class="field-group">
              <label>Frecuencia Cardíaca:</label>
              <span class="input-with-unit">
                <input type="text" name="fc_presente_feto${contadorFetos}" value="" class="form-input">
                <span>mostrando: <input type="text" name="fc_valor_feto${contadorFetos}" class="input-small" value=""> Lpm.</span>
              </span>
            </div>
            <div class="field-group">
              <label>Translucencia Nucal (TN):</label>
              <input type="text" name="tn_valor_feto${contadorFetos}" value="" class="form-input">
            </div>
            <div class="field-group">
              <label>Hueso Nasal:</label>
              <input type="text" name="hueso_nasal_feto${contadorFetos}" value="" class="form-input">
            </div>
            <div class="field-group observation">
              <label>OBSERVACIÓN:</label>
              <input type="text" name="feto${contadorFetos}_observacion" value="" class="form-input">
            </div>
          </div>
        `
      } else {
        // Para obstetrica-2do-3er
        nuevoFetoSection.innerHTML = `
          <div class="section-header">
            <h3><i class="fas fa-baby"></i> FETO ${contadorFetos} <button type="button" class="remove-section"><i class="fas fa-trash"></i></button></h3>
          </div>
          <div class="section-body">
            <div class="field-group">
              <label>Presentación Fetal:</label>
              <input type="text" name="feto${contadorFetos}_presentacion" value="" class="form-input">
            </div>
            <div class="field-group">
              <label>Situación Fetal:</label>
              <input type="text" name="feto${contadorFetos}_situacion" value="" class="form-input">
            </div>
            <div class="field-group">
              <label>Posición Fetal:</label>
              <input type="text" name="feto${contadorFetos}_posicion" value="" class="form-input">
            </div>
            <div class="field-group">
              <label>Movimientos Fetales:</label>
              <input type="text" name="feto${contadorFetos}_movimientos" value="" class="form-input">
            </div>
            <div class="field-group">
              <label>Frecuencia Cardíaca:</label>
              <span class="input-with-unit">
                <input type="text" name="feto${contadorFetos}_fc" value="" class="form-input">
                <span>mostrando: <input type="text" name="feto${contadorFetos}_fc_valor" class="input-small" value=""> Lat/min.</span>
              </span>
            </div>
            <div class="field-group observation">
              <label>OBSERVACIÓN:</label>
              <input type="text" name="feto${contadorFetos}_observacion" value="" class="form-input">
            </div>
          </div>
        `
      }

      // Insertar la nueva sección después de la sección de feto original
      const fetoOriginal = document.querySelector(`#form-${tipoFormulario} .section-card:first-child`)
      if (fetoOriginal && fetoOriginal.nextSibling) {
        formContent.insertBefore(nuevoFetoSection, fetoOriginal.nextSibling)
      } else {
        formContent.appendChild(nuevoFetoSection)
      }

      // Agregar event listener al botón de eliminar
      const removeBtn = nuevoFetoSection.querySelector(".remove-section")
      if (removeBtn) {
        removeBtn.addEventListener("click", () => {
          nuevoFetoSection.classList.add("hidden")
        })
      }

      // Crear una sección de biometría para el nuevo feto en caso de 2do-3er trimestre
      if (tipoFormulario === "obstetrica-2do-3er") {
        const nuevaBiometriaSection = document.createElement("div")
        nuevaBiometriaSection.className = "section-card feto-adicional-biometria"
        nuevaBiometriaSection.innerHTML = `
          <div class="section-header">
            <h3><i class="fas fa-ruler"></i> BIOMETRÍA FETAL ${contadorFetos} <button type="button" class="remove-section"><i class="fas fa-trash"></i></button></h3>
          </div>
          <div class="section-body">
            <div class="field-group">
              <label>Parámetros Fetales:</label>
            </div>
            <div class="field-group">
              <span>Diámetro Biparietal (DBP): <input type="text" name="biometria${contadorFetos}_dbp" class="input-small" value=""> mm.</span>
            </div>
            <div class="field-group">
              <span>Circunferencia Craneana (CC): <input type="text" name="biometria${contadorFetos}_cc" class="input-small" value=""> mm.</span>
            </div>
            <div class="field-group">
              <span>Circunferencia Abdominal (CA): <input type="text" name="biometria${contadorFetos}_ca" class="input-small" value=""> mm.</span>
            </div>
            <div class="field-group">
              <span>Longitud de Fémur (LF): <input type="text" name="biometria${contadorFetos}_lf" class="input-small" value=""> mm.</span>
            </div>
            <div class="field-group">
              <span>Edad Gestacional: <input type="text" name="biometria${contadorFetos}_eg" class="input-small" value=""> semanas.</span>
            </div>
            <div class="field-group">
              <span>Peso: <input type="text" name="biometria${contadorFetos}_peso" value=""></span>
            </div>
            <div class="field-group observation">
              <label>OBSERVACIÓN:</label>
              <input type="text" name="biometria${contadorFetos}_observacion" value="" class="form-input">
            </div>
          </div>
        `

        // Insertar después de la biometría original
        const biometriaOriginal = document.querySelector(`#form-${tipoFormulario} .section-card:nth-child(2)`)
        if (biometriaOriginal && biometriaOriginal.nextSibling) {
          formContent.insertBefore(nuevaBiometriaSection, biometriaOriginal.nextSibling)
        } else {
          formContent.appendChild(nuevaBiometriaSection)
        }

        // Agregar event listener al botón de eliminar
        const removeBiometriaBtn = nuevaBiometriaSection.querySelector(".remove-section")
        if (removeBiometriaBtn) {
          removeBiometriaBtn.addEventListener("click", () => {
            nuevaBiometriaSection.classList.add("hidden")
          })
        }
      }

      // Actualizar el número de fetos en el campo correspondiente
      const campoNumeroFetos = document.querySelector(`#form-${tipoFormulario} [name="feto_numero"]`)
      if (campoNumeroFetos) {
        campoNumeroFetos.value = contadorFetos > 1 ? `${contadorFetos}` : "uno"
      }

      // Scroll a la nueva sección
      nuevoFetoSection.scrollIntoView({ behavior: "smooth", block: "start" })

      mostrarNotificacion(`Feto ${contadorFetos} agregado correctamente`, "success")
    }
  }

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
    contadorFetos = 1 // Resetear contador de fetos

    // Resetear botones
    document.getElementById("generarPDFBtn").disabled = true

    // Quitar selección de exámenes
    document.querySelectorAll(".exam-option").forEach((option) => {
      option.classList.remove("selected")
    })

    // Eliminar fetos adicionales
    document.querySelectorAll(".feto-adicional, .feto-adicional-biometria").forEach((el) => {
      el.remove()
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

      // Resetear contador de fetos
      contadorFetos = 1

      // Eliminar fetos adicionales previos
      document.querySelectorAll(".feto-adicional, .feto-adicional-biometria").forEach((el) => {
        el.remove()
      })

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

      // Información del paciente en formato de tabla - ALINEADO CON EL ENCABEZADO
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      // Coordenadas alineadas con el encabezado
      const margenIzquierdo = 15  // Mismo margen que usaremos para las secciones
      const anchoTotal = 180      // Mismo ancho que usaremos para las secciones
      const tableY = 40

      // Marco principal de datos del paciente
      doc.rect(margenIzquierdo, tableY, anchoTotal, 25)

      // Fila 1: Nombre
      doc.rect(margenIzquierdo, tableY, anchoTotal, 8)
      doc.setFont("helvetica", "bold")
      doc.text("NOMBRE Y APELLIDOS:", margenIzquierdo + 2, tableY + 5)
      doc.setFont("helvetica", "normal")
      doc.text(paciente, margenIzquierdo + 55, tableY + 5)

      // Fila 2: Sexo y Edad
      doc.rect(margenIzquierdo, tableY + 8, 90, 8)
      doc.rect(margenIzquierdo + 90, tableY + 8, 90, 8)
      doc.setFont("helvetica", "bold")
      doc.text("SEXO:", margenIzquierdo + 2, tableY + 13)
      doc.text("EDAD:", margenIzquierdo + 92, tableY + 13)
      doc.setFont("helvetica", "normal")
      doc.text(sexo, margenIzquierdo + 20, tableY + 13)
      doc.text(`${edad} AÑOS`, margenIzquierdo + 110, tableY + 13)

      // Fila 3: Fecha
      doc.rect(margenIzquierdo, tableY + 16, anchoTotal, 9)
      doc.setFont("helvetica", "bold")
      doc.text("FECHA DE INFORME:", margenIzquierdo + 2, tableY + 21)
      doc.setFont("helvetica", "normal")
      doc.text(fecha, margenIzquierdo + 55, tableY + 21)

      // Título para el examen - ALINEADO
      doc.rect(margenIzquierdo, tableY + 30, anchoTotal, 8)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("EL EXAMEN ECOGRÁFICO ACTUAL MUESTRA:", margenIzquierdo + 2, tableY + 35)

      // Contenido del formulario
      let yPos = tableY + 45
      yPos = agregarContenidoFormulario(doc, formularioActual, yPos)

      // Agregar hipótesis/conclusión - ALINEADO
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.rect(margenIzquierdo, yPos, anchoTotal, 20)
      doc.setFont("helvetica", "bold")
      doc.text("HIPÓTESIS:", margenIzquierdo + 2, yPos + 6)
      doc.setFont("helvetica", "normal")

      const hipotesisTexto = hipotesis || obtenerHipotesisDefault(formularioActual)
      const lineasHipotesis = doc.splitTextToSize(hipotesisTexto, anchoTotal - 4)
      doc.text(lineasHipotesis, margenIzquierdo + 2, yPos + 12)

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
   
    return  "ECOGRAFÍA NORMAL"
  }

  // Función para agregar contenido del formulario al PDF con rectángulos perfectamente alineados
  function agregarContenidoFormulario(doc, tipo, yPos) {
    const formulario = document.getElementById(`form-${tipo}`)
    const secciones = formulario.querySelectorAll(".section-card")
    
    // COORDENADAS EXACTAMENTE ALINEADAS CON EL ENCABEZADO
    const margenIzquierdo = 15   // Mismo margen que el encabezado
    const anchoRectangulo = 180  // Mismo ancho que el encabezado
    const margenInterno = 2

    secciones.forEach((seccion) => {
      // Verificar si la sección ha sido eliminada
      if (seccion.classList.contains("hidden")) {
        return
      }

      const titulo = seccion
        .querySelector("h3")
        .textContent.trim()
        .replace(/\s*\u00D7$/, "")
      const campos = seccion.querySelectorAll(".field-group")

      // Verificar si necesitamos una nueva página
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }

      // Calcular altura necesaria para la sección
      let alturaContenido = 8 // Altura del título
      let contenidoSeccion = []

      // Procesar campos y calcular contenido
      campos.forEach((campo) => {
        const label = campo.querySelector("label")
        if (label) {
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
                const inputPattern = new RegExp(input.outerHTML.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
                spanTexto = spanTexto.replace(inputPattern, input.value.trim())
              } else {
                const inputPattern = new RegExp(input.outerHTML.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
                spanTexto = spanTexto.replace(inputPattern, "___")
              }
            })

            spanTexto = spanTexto.replace(/\s+/g, " ").trim()
            if (spanTexto && spanTexto !== span.textContent) {
              valorTexto += spanTexto + " "
            }
          })

          // Construir línea final
          const lineaCompleta = labelText.includes("OBSERVACIÓN") 
            ? `${labelText} ${valorTexto.trim() || "Ninguna"}`
            : `• ${labelText} ${valorTexto.trim()}`

          contenidoSeccion.push({
            texto: lineaCompleta,
            esObservacion: labelText.includes("OBSERVACIÓN")
          })

          // Calcular líneas necesarias usando el ancho exacto
          const lineasTexto = doc.splitTextToSize(lineaCompleta, anchoRectangulo - 6)
          alturaContenido += lineasTexto.length * 4 + 1
        }
      })

      // Agregar padding adicional
      alturaContenido += 6

      // Verificar si cabe en la página actual
      if (yPos + alturaContenido > 280) {
        doc.addPage()
        yPos = 20
      }

      // Dibujar rectángulo principal de la sección - PERFECTAMENTE ALINEADO
      doc.setLineWidth(0.5)
      doc.rect(margenIzquierdo, yPos, anchoRectangulo, alturaContenido)

      // Dibujar rectángulo del título - ALINEADO
      doc.rect(margenIzquierdo, yPos, anchoRectangulo, 8)

      // Escribir título
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text(titulo, margenIzquierdo + margenInterno, yPos + 5)

      // Escribir contenido
      let yPosContenido = yPos + 12
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)

      contenidoSeccion.forEach((item) => {
        if (yPosContenido > 275) {
          doc.addPage()
          yPosContenido = 20
        }

        if (item.esObservacion) {
          doc.setFont("helvetica", "italic")
        } else {
          doc.setFont("helvetica", "normal")
        }

        // Usar el ancho exacto para mantener la alineación
        const lineasTexto = doc.splitTextToSize(item.texto, anchoRectangulo - 6)
        doc.text(lineasTexto, margenIzquierdo + margenInterno, yPosContenido)
        yPosContenido += lineasTexto.length * 4 + 1
      })

      yPos += alturaContenido + 3 // Espacio entre secciones
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