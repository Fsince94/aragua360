// 💡 Este archivo de utilidad aplica el Principio de Responsabilidad Única (SRP).
//    Su única tarea es manejar la lógica de conversión de URLs de Imgur,
//    haciendo que el código sea más limpio y reutilizable.

/**
 * Convierte una URL de una página de Imgur (ej. https://imgur.com/aBcDeF)
 * a una URL de imagen directa (ej. https://i.imgur.com/aBcDeF.jpg).
 * Si la URL ya es un enlace directo o no es de Imgur, la devuelve sin cambios.
 *
 * @param url La URL a procesar.
 * @returns La URL de la imagen directa, lista para ser usada en una etiqueta <img>.
 */
export const convertToDirectImgurUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);

    // ⚙️ Comprueba si el dominio es 'imgur.com' y si la ruta no es un álbum ('/a/').
    //    Esto se dirige específicamente a los enlaces de página de una sola imagen.
    if (urlObj.hostname === 'imgur.com' && !urlObj.pathname.startsWith('/a/') && urlObj.pathname.length > 1) {
      const imageId = urlObj.pathname.split('/').pop();
      if (imageId) {
        // 🧩 Construye la URL directa usando el subdominio 'i.imgur.com' y añadiendo una extensión.
        return `https://i.imgur.com/${imageId}.jpg`;
      }
    }
    
    // Si ya es un enlace directo (i.imgur.com) o de otro dominio, no se necesita ninguna acción.
    return url;
  } catch (e) {
    // En caso de que se proporcione una URL inválida que no se pueda analizar,
    // se devuelve la entrada original para evitar que la aplicación se bloquee.
    console.warn("Could not parse URL, returning original:", url);
    return url;
  }
};
