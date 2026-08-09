type BookingConfirmationProps = {
  customerName: string;
  serviceName: string;
  staffName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price: number;
};

export function BookingConfirmationEmail({customerName, serviceName, staffName, bookingDate, startTime, endTime, price}: BookingConfirmationProps) {
  return (
    <div style={{fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto'}}>
      <h1 style={{fontSize: '20px'}}>Booking Dikonfirmasi ✅</h1>
      <p>Halo {customerName},</p>
      <p>Terima kasih sudah melakukan booking. Berikut detail reservasi kamu:</p>

      <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '16px'}}>
        <tbody>
          <tr>
            <td style={{padding: '8px 0', color: '#666'}}>Layanan</td>
            <td style={{padding: '8px 0', fontWeight: 'bold'}}>{serviceName}</td>
          </tr>
          <tr>
            <td style={{padding: '8px 0', color: '#666'}}>Staff</td>
            <td style={{padding: '8px 0', fontWeight: 'bold'}}>{staffName}</td>
          </tr>
          <tr>
            <td style={{padding: '8px 0', color: '#666'}}>Tanggal</td>
            <td style={{padding: '8px 0', fontWeight: 'bold'}}>{bookingDate}</td>
          </tr>
          <tr>
            <td style={{padding: '8px 0', color: '#666'}}>Jam</td>
            <td style={{padding: '8px 0', fontWeight: 'bold'}}>
              {startTime} - {endTime}
            </td>
          </tr>
          <tr>
            <td style={{padding: '8px 0', color: '#666'}}>Harga</td>
            <td style={{padding: '8px 0', fontWeight: 'bold'}}>Rp {price.toLocaleString('id-ID')}</td>
          </tr>
        </tbody>
      </table>

      <p style={{marginTop: '24px', color: '#666', fontSize: '14px'}}>
        Status booking kamu saat ini: <strong>Menunggu konfirmasi admin</strong>. Kami akan hubungi kamu jika ada perubahan.
      </p>
    </div>
  );
}
