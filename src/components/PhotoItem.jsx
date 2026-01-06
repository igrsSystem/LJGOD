import './PhotoItem.css'

function PhotoItem({ photo, onPaymentStatusChange, onPaymentMethodChange, onDelete }) {
  return (
    <div className="photo-item">
      {/* Imagem */}
      <div className="photo-image">
        <img src={photo.image} alt="Foto capturada" />
        {/* <span className="image-label">IMAGEM</span> */}
      </div>

      {/* Botão PG / não PG */}
      <div className="payment-status">
        <button 
          className={`btn-toggle ${photo.pago ? 'pago' : 'nao-pago'}`}
          onClick={() => onPaymentStatusChange(photo.id, !photo.pago)}
        >
           {photo.pago ? 'Pago' : 'Não Pago'}
        </button>
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
