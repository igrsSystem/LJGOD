import { useState, useRef, useEffect } from 'react'
import './App.css'
import PhotoItem from './components/PhotoItem'
import mockPhotos from './data/mockPhotos.json'

function App() {
  const [photos, setPhotos] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Função para carregar fotos
  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    setLoading(true)
    
    // ============================================
    // CARREGAR DA API - DESCOMENTAR QUANDO PRONTO
    // ============================================
    
    try {
      const response = await fetch('https://fd95d6015009.ngrok-free.app/lavagem', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer SEU_TOKEN'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar fotos da API')
      }
      
      const dataResponse = await response.json()
      const {data} = dataResponse;
      
      if(!data.length){
        setPhotos(mockPhotos)
        setLoading(false)
        console.log('Nenhuma foto na API, usando dados locais.')
        return
      }

      setPhotos(data.map(item => ({
        id: item.id || item._id,
        image: `https://fd95d6015009.ngrok-free.app/files/images/${item.image_url}`,
        pago: item.charge,
        formaPagamento: item.payment_method
      })))

      console.log('Fotos carregadas da API:', data)
    } catch (error) {
      console.error('Erro ao carregar fotos:', error)
      alert('Erro ao carregar fotos. Usando dados locais.')
      // Em caso de erro, carrega dados mockados
      setPhotos(mockPhotos)
    }
    
    setLoading(false)
  }

  // Função para abrir a câmera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Usa câmera traseira em celulares
      })
      streamRef.current = stream
      setShowCamera(true)
      
      // Aguarda o vídeo estar pronto
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (err) {
      alert('Erro ao acessar a câmera: ' + err.message)
    }
  }

  // Função para tirar foto
  const takePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      
      const imageData = canvas.toDataURL('image/jpeg')
      
      // Cria objeto com os dados da foto
      const novaFoto = {
        id: Date.now(),
        image: imageData, // Base64 da imagem
        pago: false,
        formaPagamento: 'INFORMAR'
      }
      
      // ============================================
      // ENVIO PARA API - DESCOMENTAR QUANDO PRONTO
      // ============================================
    
      try {
        const response = await fetch('https://fd95d6015009.ngrok-free.app/lavagem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer SEU_TOKEN' // Se precisar de autenticação
          },
          body: JSON.stringify({
            image_url: imageData, // Base64 completo
            charge: false,
            payment_method: 'INFORMAR'
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro ao salvar foto na API')
        }
        
        const data = await response.json()
        
        // Atualiza a foto com o ID retornado pela API
        novaFoto.id = data.id || data._id
        
        console.log('Foto salva com sucesso:', data)
      } catch (error) {
        console.error('Erro ao enviar foto para API:', error)
        alert('Erro ao salvar foto. Verifique sua conexão.')
        // Continua salvando localmente mesmo com erro na API
      }
      
      // Fecha a câmera
      closeCamera()
      // Adiciona nova foto à lista
      //setPhotos([...photos, novaFoto])
      await loadPhotos() // Recarrega fotos da API para garantir sincronização
      

    }
  }

  // Função para fechar a câmera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  // Atualiza status de pagamento
  const updatePaymentStatus = async (id, pago) => {
    // Atualiza localmente
    // setPhotos(photos.map(photo => 
    //   photo.id === id ? { ...photo, pago } : photo
    // ))
    
 
   try{
      const response = await fetch(`https://fd95d6015009.ngrok-free.app/lavagem/${id}/charge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer SEU_TOKEN'
        },
        body: JSON.stringify({ charge: pago })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar status na API')
      }
      // Recarrega fotos da API para garantir sincronização
      await
          loadPhotos()
     
      console.log('Status atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      // Mantém alteração local mesmo com erro
    }
    
  }

  // Atualiza forma de pagamento
  const updatePaymentMethod = async (id, formaPagamento) => {
    // setPhotos(photos.map(photo => 
    //   photo.id === id ? { ...photo, formaPagamento } : photo
    // ))

      try{
      const response = await fetch(`https://fd95d6015009.ngrok-free.app/lavagem/${id}/payment_method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer SEU_TOKEN'
        },
        body: JSON.stringify({ payment_method: formaPagamento })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar payment_method na API')
      }
      // Recarrega fotos da API para garantir sincronização
      await
          loadPhotos()
     
      console.log('payment_method atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar payment_method:', error)
      // Mantém alteração local mesmo com erro
    }
  }

  // Excluir resgistro

  const deletePhoto = async (id) => {
    try {
      const response = await fetch(`https://fd95d6015009.ngrok-free.app/lavagem/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir foto na API')
      }

      // Remove a foto da lista local
      setPhotos(photos.filter(photo => photo.id !== id))
      console.log('Foto excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir foto:', error)
    }
  }

  return (
    <div className="app-container">
      {/* Botão para tirar foto */}
      <div className="header">
        <button className="btn-camera" onClick={openCamera}>
         📷 Registrar Lavagem
        </button>
      </div>

      {/* Modal da câmera */}
      {showCamera && (
        <div className="camera-modal">
          <div className="camera-container">
            <video ref={videoRef} autoPlay playsInline />
            <div className="camera-controls">
              <button className="btn-capture" onClick={takePhoto}>
                📷 Capturar
              </button>
              <button className="btn-cancel" onClick={closeCamera}>
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de fotos */}
      {loading ? (
        <div className="loading">Carregando fotos...</div>
      ) : (
        <div className="photos-list">
          {photos.length === 0 ? (
            <div className="empty-state">
              Nenhuma foto registrada. Clique no botão acima para começar.
            </div>
          ) : (
            photos.map(photo => (
              <PhotoItem
                key={photo.id}
                photo={photo}
                onPaymentStatusChange={updatePaymentStatus}
                onPaymentMethodChange={updatePaymentMethod}
                onDelete={deletePhoto}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default App
