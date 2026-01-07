import './PhotoItem.css'
import { useState, useEffect } from 'react'

function PhotoItem({ photo, onPaymentStatusChange, onPaymentMethodChange, onPaymentValueChange, onDelete }) {
  // inputRaw holds the user's typed string while typing (e.g. "100" or "1.234,56")
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  const formatCentsToBRL = (cents) => {
    if (cents === null || cents === undefined || cents === '') return ''
    const n = Number(cents) / 100
    if (Number.isNaN(n)) return ''
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const parseReaisStringToCents = (str) => {
    if (!str) return 0
    // Remove spaces, thousand separators (.) and convert comma to dot
    const cleaned = String(str).trim().replace(/\./g, '').replace(/,/g, '.')
    const float = parseFloat(cleaned)
    if (Number.isNaN(float)) return 0
    return Math.round(float * 100)
  }

  useEffect(() => {
    if (photo && (photo.valor !== undefined && photo.valor !== null)) {
      setInputValue(formatCentsToBRL(photo.valor))
    } else {
      setInputValue('')
    }
    setError('')
  }, [photo && photo.valor])

  const handleChange = (e) => {
    const raw = e.target.value
    // Allow digits, dots and commas while typing; keep raw for user input
    const cleanedForDisplay = raw.replace(/[^0-9\.,]/g, '')
    console.log('handleChange cleanedForDisplay:', cleanedForDisplay,'->',raw)
    setInputValue(cleanedForDisplay)
    // Basic validation while typing
    const cents = parseReaisStringToCents(cleanedForDisplay)
    if (cents < 0) {
      setError('Valor inválido')
    } else {
      setError('')
    }
  }

  const handleBlur = () => {
    if (!inputValue) setInputValue('')
    // On blur, parse the typed value as reais and convert to cents, then format nicely
    const cents = parseReaisStringToCents(inputValue)
    // format for display
    setInputValue(formatCentsToBRL(cents))
    // send decimal (reais) to parent (e.g., 70 -> 70.00)
    const decimal = Number((cents / 100).toFixed(2))
    console.log('handleBlur sending decimal value:', decimal)
    onPaymentValueChange && onPaymentValueChange(photo.id, decimal)
  }

  const handleKeyDown = (e) => {
    // On Enter, commit the value and blur
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  // Image zoom state
  const [zoomOpen, setZoomOpen] = useState(false)

  const openZoom = () => setZoomOpen(true)
  const closeZoom = () => setZoomOpen(false)

  useEffect(() => {
    const onEsc = (ev) => {
      if (ev.key === 'Escape') setZoomOpen(false)
    }
    if (zoomOpen) {
      window.addEventListener('keydown', onEsc)
    }
    return () => window.removeEventListener('keydown', onEsc)
  }, [zoomOpen])

  return (
    <div className="photo-item">
      {/* Imagem */}
      <div className="photo-image">
        <img src={photo.image} alt="Foto capturada" onClick={openZoom} />
        {/* <span className="image-label">IMAGEM</span> */}
      </div>

      {/* Zoom overlay */}
      {zoomOpen && (
        <div className="image-zoom-overlay" role="dialog" aria-modal="true" onClick={closeZoom}>
          <div className="image-zoom-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-zoom-close" onClick={closeZoom} aria-label="Fechar">✕</button>
            <img src={photo.image} alt="Foto ampliada" />
          </div>
        </div>
      )}

      {/* Botão PG / não PG */}
      <div className="payment-status">
        <button
          className={`btn-toggle ${photo.pago ? 'pago' : 'nao-pago'}`}
          onClick={() => onPaymentStatusChange(photo.id, !photo.pago)}
        >
          {photo.pago ? 'Pago' : 'N/Pago'}
        </button>
      </div>

      {/* Campo de valor (R$) */}
      <div className="payment-value">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`input-value ${error ? 'error' : ''}`}
          placeholder="0,00"
        />
        <span className="value-label">R$ VALOR</span>
        {error && <div className="value-error">{error}</div>}
      </div>

      {/* Dropdown Forma de Pagamento */}
      <div className="payment-method">
        <select
          value={photo.formaPagamento}
          onChange={(e) => onPaymentMethodChange(photo.id, e.target.value)}
          className="select-payment"
        >
          <option value="INFORMAR"></option>
          <option value="NOTA">NOTA</option>
          <option value="PIX">PIX</option>
          <option value="DINHEIRO">DINHEIRO</option>
          <option value="DEBITO">DEBITO</option>
          <option value="CREDITO">CREDITO</option>
        </select>
        <span className="payment-label">FORMA PG</span>
      </div>

      {/* Botão PG / não PG */}
      <div className="payment-exclude">
        <button
          className={`btn-toggle excluded`}
          onClick={() => onDelete(photo.id)}
        >
          {'Excluir'}
        </button>
      </div>
    </div>
  )
}

export default PhotoItem
