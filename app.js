// Fungsi Kirim Notifikasi yang Lebih Stabil untuk HP
async function sendMobileNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    alert('Izin notifikasi belum diaktifkan!');
    return;
  }

  try {
    // Tunggu Service Worker benar-benar SIAP di HP
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body: body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png',
        vibrate: [200, 100, 200],
        tag: 'deadline-reminder'
      });
    } else {
      new Notification(title, { body: body });
    }
  } catch (err) {
    console.error('Gagal mengirim notifikasi:', err);
    // Fallback standard notification
    new Notification(title, { body: body });
  }
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        // Panggil tes kirim notifikasi
        sendMobileNotification('🔔 Notifikasi Aktif!', 'Pengingat deadline berhasil terhubung ke HP kamu.');
        checkDeadlines();
      } else {
        alert('Izin notifikasi ditolak. Cek setelan browser HP Anda.');
      }
    });
  } else {
    alert('Browser HP Anda tidak mendukung web notification.');
  }
}
