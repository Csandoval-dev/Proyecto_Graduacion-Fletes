
const CLOUD_NAME = "dv0oz69cm"; // 
const UPLOAD_PRESET = "fletia_uploads"; // 

/**
 
 * 
 * @param {File} file - Archivo a subir
 * @param {string} folder - Carpeta donde guardar l
 * @returns {Promise<Object>} { success: boolean, url?: string, error?: string }
 */
export const subirArchivo = async (file, folder = "fletia") => {
  try {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if( !validarTipoArchivo(file, tiposPermitidos)){
      throw new Error("Tipo de Archivo no permitido");
    }
    if(!validarTamañoArchivo(file,5)){
      throw new Error("El archivo excede el tamaño maximo de 5MB[");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.secure_url) {
      return { success: true, url: data.secure_url };
    } else {
      throw new Error("Error al subir archivo");
    }
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return { success: false, error: error.message };
  }
};

/**
 * SUBIR MÚLTIPLES ARCHIVOS
 * 
 * @param {FileList} files - Lista de archivos
 * @param {string} folder - Carpeta donde guardar
 * @returns {Promise<Object>} {  }
 */
export const subirMultiplesArchivos = async (files, folder = "fletia") => {
  try {
    const urls = [];

    for (let i = 0; i < files.length; i++) {
      const resultado = await subirArchivo(files[i], folder);

      if (resultado.success) {
        urls.push(resultado.url);
      } else {
        console.error(`Error subiendo archivo ${i}:`, resultado.error);
      }
    }

    return { success: true, urls };
  } catch (error) {
    console.error("Error al subir múltiples archivos:", error);
    return { success: false, error: error.message, urls: [] };
  }
};

/**
 * VALIDAR TIPO DE ARCHIVO
 */
export const validarTipoArchivo = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * VALIDAR TAMAÑO DE ARCHIVO
 */
export const validarTamañoArchivo = (file, maxSizeMB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};