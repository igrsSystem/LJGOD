import { useState, useRef, useEffect } from 'react'
import './App.css'
import PhotoItem from './components/PhotoItem'
import mockPhotos from './data/mockPhotos.json'

function App() {
  const [photos, setPhotos] = useState([])
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(null)
  const [loadingTotal, setLoadingTotal] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Função para carregar fotos
  useEffect(() => {
    loadPhotos()
  }, [])

  // Helper to normalize incoming value to cents (integer)
  const parseAPIValueToCents = (value) => {
    if (value === null || value === undefined || value === '') return 0
    if (typeof value === 'number') {
      // If it's a float (has decimals), treat as reais -> convert to cents
      if (!Number.isInteger(value)) return Math.round(value * 100)
      // otherwise assume it's already cents integer
      //return value
      return Math.round(value * 100)
    }
    // string: replace thousand separators and convert comma to dot
    const cleaned = String(value).replace(/\./g, '').replace(/,/g, '.')
    const float = parseFloat(cleaned)
    if (Number.isNaN(float)) return 0
    return Math.round(float * 100)
  }

  const formatDecimalToBRL = (decimal) => {
    if (decimal === null || decimal === undefined) return '0,00'
    const n = Number(decimal)
    if (Number.isNaN(n)) return '0,00'
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Fetch total amount from API (expects endpoint returning { total: 123.45 } or similar)
  const fetchTotal = async () => {
    setLoadingTotal(true)
    try {
      const res = await fetch('https://331cebd1db40.ngrok-free.app/lavagem/totalamount')
      if (!res.ok) throw new Error('Erro ao carregar total')
      const data = await res.json()
      console.log('Total fetched from API:', data)
      const raw = data.total ?? data.amount ?? data.value ?? data.valor ?? 0
      const cents = parseAPIValueToCents(raw)
      setTotal(cents / 100)
    } catch (err) {
      console.error('Erro ao buscar total:', err)
    }
    setLoadingTotal(false)
  }

  const loadPhotos = async () => {
    setLoading(true)

    // ============================================
    // CARREGAR DA API - DESCOMENTAR QUANDO PRONTO
    // ============================================

    try {
      const response = await fetch('https://331cebd1db40.ngrok-free.app/lavagem', {
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
      const { data } = dataResponse;

      if (!data.length) {
        setPhotos(mockPhotos)
        setLoading(false)
        console.log('Nenhuma foto na API, usando dados locais.')
        return
      }

      // Helper to normalize incoming value to cents (integer)
      const parseAPIValueToCents = (value) => {
        console.log('Parsing API value to cents:', value)
        if (value === null || value === undefined || value === '') return 0
        if (typeof value === 'number') {
          // If it's a float (has decimals), treat as reais -> convert to cents
          if (!Number.isInteger(value)) return Math.round(value * 100)
          // otherwise assume it's already cents integer
          console.log('tetststststst', Math.round(value * 100))
          console.log('Parsed integer value from API number(1):', value)
          return Math.round(value * 100)
        }
        // string: replace comma with dot and parse float
        const cleaned = String(value).replace(/\./g, '').replace(/,/g, '.')
        const float = parseFloat(cleaned)
        if (Number.isNaN(float)) return 0
        console.log('Parsed float value from API string(2):', float)
        return Math.round(float * 100)

      }

      setPhotos(data.map(item => ({
        id: item.id || item._id,
        image: `https://331cebd1db40.ngrok-free.app/files/images/${item.image_url}`,
        pago: item.charge,
        formaPagamento: item.payment_method,
        valor: parseAPIValueToCents(item.value || item.amount || item.valor || '')
      })))

      console.log('Fotos carregadas da API:', data)
    } catch (error) {
      console.error('Erro ao carregar fotos:', error)
      alert('Erro ao carregar fotos. Usando dados locais.')
      // Em caso de erro, carrega dados mockados
      setPhotos(mockPhotos)
    }

    // Update total after loading photos
    await fetchTotal()
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
        ,
        valor: 0 // cents
      }

      // ============================================
      // ENVIO PARA API - DESCOMENTAR QUANDO PRONTO
      // ============================================

      try {
        const response = await fetch('https://28a47bd7dccb.ngrok-free.app/lavagem', {
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


    try {
      const response = await fetch(`https://331cebd1db40.ngrok-free.app/lavagem/${id}/charge`, {
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

    try {
      const response = await fetch(`https://331cebd1db40.ngrok-free.app/lavagem/${id}/payment_method`, {
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

  // Atualiza valor do pagamento (em reais)
  // `valor` is decimal (reais) as a Number (e.g., 70.00)
  const updatePaymentValue = async (id, valor) => {


    console.log('Atualizar valor chamado para id:', id, 'com valor (reais):', valor)

    try {
      // Convert incoming decimal reais to cents integer for local storage
      const cents = Math.round(Number(valor) * 100)
      // Optimistic update locally (store cents)
      setPhotos(prev => prev.map(photo => photo.id === id ? { ...photo, valor: cents } : photo))

      // Send decimal (reais) to API (keeping two decimals)
      const decimal = Number(Number(valor).toFixed(2))

      const response = await fetch(`https://331cebd1db40.ngrok-free.app/lavagem/${id}/amount`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer SEU_TOKEN'
        },
        body: JSON.stringify({ amount: decimal })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar valor na API')
      }

      // If server returns a value, normalize it back to cents and update that photo only
      let resJson = null
      try { resJson = await response.json() } catch (e) { /* no json */ }
      if (resJson) {
        const returned = resJson.amount || resJson.value || resJson.valor
        if (returned !== undefined) {
          const returnedCents = parseAPIValueToCents(returned)
          setPhotos(prev => prev.map(photo => photo.id === id ? { ...photo, valor: returnedCents } : photo))
        }
      }

      console.log('valor atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar valor:', error)
      // on error, reload to sync server state
      await loadPhotos()
    }
    // `valor` comes in as cents (integer). We'll send it as cents in the body.

  }

  // Excluir resgistro
  const deletePhoto = async (id) => {
    try {
      const response = await fetch(`https://331cebd1db40.ngrok-free.app/lavagem/${id}`, {
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
          📷 Lavar
        </button>
        <div className="total-box" title="Total registrado">
          {/* <div className="total-label">Total</div> */}
          <div className="total-value">{loadingTotal ? '...' : `R$ ${formatDecimalToBRL(total ?? 0)}`}</div>
          <button className="btn-refresh" onClick={fetchTotal} aria-label="Atualizar total">↻</button>
        </div>
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
                onPaymentValueChange={updatePaymentValue}
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
