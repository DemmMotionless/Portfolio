// EmailJS Configuration
// Reemplaza estos valores con tus credenciales de EmailJS

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_fab0zmb', // Reemplaza con tu Service ID de EmailJS
  TEMPLATE_ID: 'template_g8vc5wr', // Reemplaza con tu Template ID de EmailJS
  PUBLIC_KEY: 'kI9N5SNF8ZsmDs7vh' // Reemplaza con tu Public Key de EmailJS
};

// Instrucciones para configurar EmailJS:
// 1. Ve a https://www.emailjs.com/ y crea una cuenta
// 2. Crea un nuevo servicio de email (Gmail, Outlook, etc.)
// 3. Crea un template de email con las siguientes variables:
//    - {{from_name}} - Nombre del remitente
//    - {{from_email}} - Email del remitente  
//    - {{subject}} - Asunto del mensaje
//    - {{message}} - Contenido del mensaje
//    - {{to_name}} - Tu nombre (Nahuel Neira)
// 4. Obtén tu Public Key desde la sección Account
// 5. Reemplaza los valores en EMAILJS_CONFIG con tus credenciales reales