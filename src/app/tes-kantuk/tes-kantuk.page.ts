import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-tes-kantuk',
  templateUrl: './tes-kantuk.page.html',
  styleUrls: ['./tes-kantuk.page.scss'],
  standalone: false,
})
export class TesKantukPage implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement?: ElementRef<HTMLCanvasElement>;

  // Variabel untuk status deteksi kantuk
  statusKantuk: string = 'Belum Terdeteksi';
  rasioAspekMata: number = 0;
  warnaStatus: string = 'gelap';
  tesBerjalan: boolean = false;

  // Data statistik real-time
  statistik = {
    tingkatKantuk: 0, // 0-100%
    waktuReaksi: 0, // dalam detik
    skorKognitif: 0, // 0-100
    terakhirDiperbarui: new Date(),
    // Tambahan properti yang dibutuhkan template
    totalTests: 0,
    sleepQuality: 0,
    improvementRate: 0,
    testDuration: '0 menit',
  };

  // Data untuk chart dan tampilan
  chartData = {
    tingkatKantuk: {
      title: 'Tingkat Kantuk',
      data: [
        { name: 'Sangat Segar', value: 20 },
        { name: 'Segar', value: 40 },
        { name: 'Normal', value: 60 },
        { name: 'Mengantuk', value: 80 },
        { name: 'Sangat Mengantuk', value: 100 },
      ],
    },
    reaksiMata: {
      title: 'Reaksi Mata',
      data: [
        { name: 'Cepat', value: 80 },
        { name: 'Normal', value: 50 },
        { name: 'Lambat', value: 20 },
      ],
    },
    kinerjaKognitif: {
      title: 'Kinerja Kognitif',
      data: [
        { name: 'Tinggi', value: 80 },
        { name: 'Sedang', value: 50 },
        { name: 'Rendah', value: 20 },
      ],
    },
    kualitasTidur: {
      title: 'Kualitas Tidur',
      data: [
        { name: 'Baik', value: 80 },
        { name: 'Cukup', value: 50 },
        { name: 'Buruk', value: 20 },
      ],
    },
  };

  // Data untuk level peringatan
  warningLevels = [
    {
      level: 'Rendah',
      color: 'success',
      description: 'Tingkat kewaspadaan baik',
    },
    {
      level: 'Sedang',
      color: 'warning',
      description: 'Mulai menunjukkan tanda lelah',
    },
    {
      level: 'Tinggi',
      color: 'danger',
      description: 'Sangat mengantuk, beristirahatlah',
    },
  ];

  // Data pola tidur
  sleepPatterns = [
    {
      time: '00:00',
      sleepiness: 20,
      reaction: 1.2,
      cognitive: 85,
      quality: 'good',
    },
    {
      time: '04:00',
      sleepiness: 80,
      reaction: 2.5,
      cognitive: 40,
      quality: 'poor',
    },
    {
      time: '08:00',
      sleepiness: 30,
      reaction: 1.0,
      cognitive: 90,
      quality: 'excellent',
    },
    {
      time: '12:00',
      sleepiness: 10,
      reaction: 0.8,
      cognitive: 95,
      quality: 'excellent',
    },
    {
      time: '16:00',
      sleepiness: 20,
      reaction: 1.1,
      cognitive: 88,
      quality: 'good',
    },
    {
      time: '20:00',
      sleepiness: 50,
      reaction: 1.8,
      cognitive: 65,
      quality: 'average',
    },
  ];

  // Data tes terbaru
  recentTests = [
    { date: '2023-11-01', status: 'Baik', score: 85 },
    { date: '2023-11-02', status: 'Cukup', score: 65 },
    { date: '2023-11-03', status: 'Baik', score: 90 },
    { date: '2023-11-04', status: 'Buruk', score: 45 },
  ];

  // Rekomendasi
  recommendations = [
    {
      title: 'Istirahat Cukup',
      description: 'Tidur minimal 7-8 jam per hari',
      priority: 'Tinggi',
      icon: 'moon-outline',
    },
    {
      title: 'Minum Air Putih',
      description: 'Minum 8 gelas air per hari',
      priority: 'Sedang',
      icon: 'water-outline',
    },
    {
      title: 'Olahraga Ringan',
      description: 'Lakukan olahraga ringan 30 menit/hari',
      priority: 'Rendah',
      icon: 'barbell-outline',
    },
  ];

  // Data performa mingguan
  weeklyPerformanceData = [
    { day: 'Sen', value: 75 },
    { day: 'Sel', value: 80 },
    { day: 'Rab', value: 65 },
    { day: 'Kam', value: 90 },
    { day: 'Jum', value: 85 },
    { day: 'Sab', value: 70 },
    { day: 'Min', value: 60 },
  ];

  // Riwayat deteksi untuk perhitungan rata-rata
  private riwayatDeteksi: {
    waktu: Date;
    rasioMata: number;
    terdeteksiKedip: boolean;
  }[] = [];

  // Variabel internal
  private waktuKedipTerakhir: number = 0;
  private jumlahKedip: number = 0;
  private waktuUpdateTerakhir: number = Date.now();
  private terdeteksiKedip: boolean = false; // Status kedipan terakhir
  private intervalDeteksi: any;
  private aliranKamera?: MediaStream;

  // Konstanta untuk deteksi kantuk
  private readonly BATAS_EAR = 0.2; // Batas rasio aspek mata untuk deteksi kedip
  private readonly BINGKAI_BERTURUTAN = 20; // Jumlah bingkai berturut-turut untuk konfirmasi kantuk
  private penghitungBingkai = 0;

  // Implementasi method dari OnInit
  async ngOnInit() {
    await this.muatModel();
  }

  // Implementasi method dari OnDestroy
  ngOnDestroy() {
    this.hentikanTes();
    if (this.intervalDeteksi) {
      clearInterval(this.intervalDeteksi);
    }
  }

  // Method untuk memulai tes kantuk
  async mulaiTes() {
    try {
      this.tesBerjalan = true;
      this.statusKantuk = 'Menyiapkan kamera...';
      this.warnaStatus = 'warning';
      await this.mulaiKamera();
    } catch (error) {
      console.error('Gagal memulai tes:', error);
      this.statusKantuk = 'Gagal memulai kamera';
      this.warnaStatus = 'danger';
      this.tesBerjalan = false;
    }
  }

  // Method untuk menghentikan tes
  hentikanTes() {
    this.tesBerjalan = false;
    this.hentikanKamera();
    this.statusKantuk = 'Tes Dihentikan';
    this.warnaStatus = 'gelap';
  }

  // Method untuk memulai tes tidur
  startSleepTest() {
    this.mulaiTes();
  }

  // Method untuk menghentikan tes tidur
  stopSleepTest() {
    this.hentikanTes();
  }

  // Method untuk merefresh data
  refreshData() {
    console.log('Memperbarui data...');
    // Implementasi refresh data
  }

  // Method untuk mengekspor data
  eksporData() {
    console.log('Mengekspor data tes kantuk...');
    // Implementasi ekspor data
  }

  // Method untuk mendapatkan warna berdasarkan nilai
  getBarColor(value: number): string {
    if (value > 70) return '#4CAF50'; // Hijau
    if (value > 40) return '#FFC107'; // Kuning
    return '#F44336'; // Merah
  }

  // Method untuk mendapatkan warna status
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'baik':
        return '#4CAF50';
      case 'cukup':
        return '#FFC107';
      case 'buruk':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  }

  // Method untuk mendapatkan warna prioritas
  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'tinggi':
        return '#F44336';
      case 'sedang':
        return '#FFC107';
      case 'rendah':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  }

  // Method untuk mendapatkan nilai tertinggi dari data mingguan
  getHighestValue(): number {
    if (!this.weeklyPerformanceData || this.weeklyPerformanceData.length === 0)
      return 0;
    return Math.max(...this.weeklyPerformanceData.map((item) => item.value));
  }

  // Method pribadi untuk menangani deteksi kantuk
  private async deteksiKantuk() {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement)
      return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Sesuaikan ukuran kanvas dengan video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Deteksi wajah dengan landmark
      const deteksi = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320, // Ukuran input yang lebih besar untuk deteksi lebih akurat
            scoreThreshold: 0.5, // Ambang skor deteksi
          })
        )
        .withFaceLandmarks();

      // Bersihkan kanvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Gambar frame video ke kanvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (deteksi) {
        // Gambar kotak deteksi wajah
        const box = deteksi.detection.box;
        context.strokeStyle = '#00ff00';
        context.lineWidth = 2;
        context.strokeRect(box.x, box.y, box.width, box.height);

        // Dapatkan landmark mata
        const mataKiri = deteksi.landmarks.getLeftEye();
        const mataKanan = deteksi.landmarks.getRightEye();

        // Hitung rasio aspek mata (EAR)
        const earKiri = this.hitungEAR(mataKiri);
        const earKanan = this.hitungEAR(mataKanan);
        this.rasioAspekMata = (earKiri + earKanan) / 2;

        // Gambar landmark mata
        this.gambarLandmarkMata(
          context,
          mataKiri,
          earKiri < this.BATAS_EAR ? '#ff0000' : '#00ff00'
        );
        this.gambarLandmarkMata(
          context,
          mataKanan,
          earKanan < this.BATAS_EAR ? '#ff0000' : '#00ff00'
        );

        // Gambar rasio EAR di dekat mata
        context.font = '16px Arial';
        context.fillStyle = '#ffffff';
        context.strokeStyle = '#000000';
        context.lineWidth = 2;

        // Tampilkan EAR di dekat mata kiri
        const textKiri = `L: ${earKiri.toFixed(2)}`;
        context.strokeText(textKiri, mataKiri[0].x - 30, mataKiri[0].y - 10);
        context.fillText(textKiri, mataKiri[0].x - 30, mataKiri[0].y - 10);

        // Tampilkan EAR di dekat mata kanan
        const textKanan = `R: ${earKanan.toFixed(2)}`;
        context.strokeText(textKanan, mataKanan[3].x + 10, mataKanan[3].y - 10);
        context.fillText(textKanan, mataKanan[3].x + 10, mataKanan[3].y - 10);

        // Tampilkan status kantuk
        context.font = '20px Arial';
        const statusText = `Status: ${this.statusKantuk}`;
        const statusWidth = context.measureText(statusText).width;
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(10, 10, statusWidth + 20, 30);
        context.fillStyle = '#ffffff';
        context.fillText(statusText, 20, 30);

        // Tampilkan jumlah kedipan
        const blinkText = `Kedip: ${this.jumlahKedip}`;
        const blinkWidth = context.measureText(blinkText).width;
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(10, 50, blinkWidth + 20, 30);
        context.fillStyle = '#ffffff';
        context.fillText(blinkText, 20, 70);

        // Perbarui status kantuk
        this.perbaruiStatusKantuk();
      } else {
        // Jika tidak ada wajah terdeteksi
        context.font = '20px Arial';
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillText('Mencoba mendeteksi wajah...', 20, 30);

        this.statusKantuk = 'Wajah tidak terdeteksi';
        this.warnaStatus = 'warning';
      }
    } catch (error) {
      console.error('Error deteksi wajah:', error);
      this.statusKantuk = 'Error deteksi';
      this.warnaStatus = 'danger';
    }
  }

  // Method untuk menghitung Eye Aspect Ratio (EAR)
  private hitungEAR(mata: { x: number; y: number }[]): number {
    // Hitung jarak vertikal mata
    const A = this.hitungJarak(mata[1], mata[5]);
    const B = this.hitungJarak(mata[2], mata[4]);

    // Hitung jarak horizontal mata
    const C = this.hitungJarak(mata[0], mata[3]);

    // Hitung rasio aspek mata
    return (A + B) / (2 * C);
  }

  // Method untuk menghitung jarak antara dua titik
  private hitungJarak(
    titik1: { x: number; y: number },
    titik2: { x: number; y: number }
  ): number {
    return Math.sqrt(
      Math.pow(titik2.x - titik1.x, 2) + Math.pow(titik2.y - titik1.y, 2)
    );
  }

  // Method untuk memperbarui status kantuk berdasarkan deteksi terbaru
  private perbaruiStatusKantuk() {
    const sekarang = Date.now();
    const kedipTerdeteksi = this.rasioAspekMata < this.BATAS_EAR;

    // Tambahkan ke riwayat deteksi
    this.riwayatDeteksi.push({
      waktu: new Date(),
      rasioMata: this.rasioAspekMata,
      terdeteksiKedip: kedipTerdeteksi,
    });

    // Batasi ukuran riwayat (menyimpan data 30 detik terakhir)
    const batasWaktu = 30000; // 30 detik
    this.riwayatDeteksi = this.riwayatDeteksi.filter(
      (d) => sekarang - d.waktu.getTime() <= batasWaktu
    );

    // Hitung rata-rata EAR dalam 5 detik terakhir
    const deteksi5DetikTerakhir = this.riwayatDeteksi.filter(
      (d) => sekarang - d.waktu.getTime() <= 5000
    );

    const rataRataEAR =
      deteksi5DetikTerakhir.length > 0
        ? deteksi5DetikTerakhir.reduce((sum, d) => sum + d.rasioMata, 0) /
          deteksi5DetikTerakhir.length
        : 0;

    // Deteksi kedipan
    if (kedipTerdeteksi && sekarang - this.waktuKedipTerakhir > 300) {
      this.jumlahKedip++;
      this.waktuKedipTerakhir = sekarang;

      // Reset status kedipan setelah 500ms
      setTimeout(() => {
        this.terdeteksiKedip = false;
      }, 500);
    }

    // Hitung tingkat kedipan per menit
    const deteksi1MenitTerakhir = this.riwayatDeteksi.filter(
      (d) => sekarang - d.waktu.getTime() <= 60000
    );

    const jumlahKedip1Menit = deteksi1MenitTerakhir.filter(
      (d) => d.terdeteksiKedip
    ).length;
    const tingkatKedip = (jumlahKedip1Menit / 60) * 100; // Konversi ke persentase

    // Perbarui status kantuk berdasarkan beberapa faktor
    if (kedipTerdeteksi) {
      this.penghitungBingkai++;

      // Jika mata tertutup lebih dari 1 detik (10 frame) berturut-turut
      if (this.penghitungBingkai >= 10) {
        this.statusKantuk = 'Sangat Mengantuk';
        this.warnaStatus = 'danger';
      }
      // Jika tingkat kedipan rendah tapi mata tertutup lama
      else if (tingkatKedip < 5 && this.penghitungBingkai >= 5) {
        this.statusKantuk = 'Mengantuk';
        this.warnaStatus = 'warning';
      } else {
        this.statusKantuk = 'Berkedip';
        this.warnaStatus = 'info';
      }
    } else {
      this.penghitungBingkai = 0;

      // Tentukan status berdasarkan tingkat kedipan dan EAR
      if (rataRataEAR > 0 && rataRataEAR < this.BATAS_EAR * 1.2) {
        this.statusKantuk = 'Mulai Lelah';
        this.warnaStatus = 'warning';
      } else if (tingkatKedip > 20) {
        // Kedipan cepat bisa menandakan kelelahan
        this.statusKantuk = 'Lelah';
        this.warnaStatus = 'warning';
      } else {
        this.statusKantuk = 'Waspada';
        this.warnaStatus = 'success';
      }
    }

    // Perbarui statistik
    this.perbaruiStatistik();
  }

  // Method untuk memperbarui statistik
  private perbaruiStatistik() {
    if (this.riwayatDeteksi.length < 2) return;

    const sekarang = Date.now();
    const jendelaWaktu = 5000; // Jendela waktu 5 detik untuk perhitungan

    // Filter deteksi terbaru
    const deteksiTerbaru = this.riwayatDeteksi.filter(
      (d) => sekarang - d.waktu.getTime() <= jendelaWaktu
    );

    if (deteksiTerbaru.length < 2) return;

    // Hitung rata-rata EAR
    const rataRataEAR =
      deteksiTerbaru.reduce((total, d) => total + d.rasioMata, 0) /
      deteksiTerbaru.length;

    // Hitung tingkat kedipan
    const waktuBerlalu =
      (deteksiTerbaru[deteksiTerbaru.length - 1].waktu.getTime() -
        deteksiTerbaru[0].waktu.getTime()) /
      1000;
    const jumlahKedip = deteksiTerbaru.filter((d) => d.terdeteksiKedip).length;
    const tingkatKedip =
      waktuBerlalu > 0 ? (jumlahKedip / waktuBerlalu) * 60 : 0;

    // Perbarui statistik dengan semua properti yang diperlukan
    this.statistik = {
      tingkatKantuk: parseFloat(
        Math.max(0, Math.min(100, 100 - rataRataEAR * 200)).toFixed(1)
      ),
      waktuReaksi: parseFloat(
        Math.max(0.5, Math.min(3.0, 3.0 - tingkatKedip / 10)).toFixed(1)
      ),
      skorKognitif: parseFloat(
        Math.max(
          0,
          Math.min(
            100,
            rataRataEAR * 100 * (1 - Math.min(1, tingkatKedip / 30))
          )
        ).toFixed(1)
      ),
      terakhirDiperbarui: new Date(),
      // Menyimpan nilai-nilai yang sudah ada atau menggunakan default
      totalTests: this.statistik?.totalTests || 0,
      sleepQuality: this.statistik?.sleepQuality || 0,
      improvementRate: this.statistik?.improvementRate || 0,
      testDuration: this.statistik?.testDuration || '0 menit',
    };
  }

  // Method untuk mendapatkan level kantuk saat ini
  dapatkanLevelKantuk(): string {
    const tingkatKantuk = this.statistik.tingkatKantuk;

    if (tingkatKantuk < 30) return 'Sangat Segar';
    if (tingkatKantuk < 50) return 'Segar';
    if (tingkatKantuk < 70) return 'Normal';
    if (tingkatKantuk < 85) return 'Mengantuk';
    return 'Sangat Mengantuk';
  }

  // Method untuk mendapatkan warna berdasarkan tingkat kantuk
  dapatkanWarnaKantuk(tingkatKantuk: number): string {
    if (tingkatKantuk < 30) return '#4CAF50'; // Hijau
    if (tingkatKantuk < 50) return '#8BC34A'; // Hijau Muda
    if (tingkatKantuk < 70) return '#FFC107'; // Kuning
    if (tingkatKantuk < 85) return '#FF9800'; // Oranye
    return '#F44336'; // Merah
  }

  // Method untuk menggambar landmark mata di kanvas
  private gambarLandmarkMata(
    context: CanvasRenderingContext2D,
    landmarks: { x: number; y: number }[],
    color: string
  ) {
    if (!context) return;

    // Gambar garis penghubung antar landmark mata
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 2;

    // Gambar garis mengelilingi mata
    for (let i = 0; i < landmarks.length; i++) {
      const nextIndex = (i + 1) % landmarks.length;
      context.moveTo(landmarks[i].x, landmarks[i].y);
      context.lineTo(landmarks[nextIndex].x, landmarks[nextIndex].y);
    }

    context.stroke();

    // Gambar titik-titik landmark
    context.fillStyle = color;
    landmarks.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      context.fill();
    });
  }

  // Method untuk mendapatkan label kualitas tidur
  getSleepQualityLabel(quality: string): string {
    if (!quality) return 'Tidak Diketahui';

    switch (quality.toLowerCase()) {
      case 'excellent':
        return 'Sangat Baik';
      case 'good':
        return 'Baik';
      case 'average':
        return 'Cukup';
      case 'poor':
        return 'Kurang';
      default:
        return 'Tidak Diketahui';
    }
  }

  // Method untuk mendapatkan rekomendasi berdasarkan test
  getRecommendation(test: any): string {
    if (test.recommendation) {
      return test.recommendation;
    }

    if (test.status === 'danger' || test.status === 'Buruk') {
      return 'Tingkat kewaspadaan rendah, disarankan istirahat sejenak';
    } else if (test.status === 'warning' || test.status === 'Cukup') {
      return 'Tingkat kewaspadaan menurun, waspada';
    } else {
      return 'Tingkat kewaspadaan baik';
    }
  }

  // Method untuk memuat model deteksi wajah
  private async muatModel() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/weights');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/weights');
      console.log('Model deteksi wajah berhasil dimuat');
    } catch (error) {
      console.error('Gagal memuat model deteksi wajah:', error);
      this.statusKantuk = 'Gagal memuat model';
      this.warnaStatus = 'danger';
    }
  }

  // Method untuk memulai kamera
  private async mulaiKamera() {
    try {
      this.aliranKamera = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.aliranKamera;
        this.intervalDeteksi = setInterval(() => this.deteksiKantuk(), 100);
      }
    } catch (error) {
      console.error('Gagal mengakses kamera:', error);
      throw error;
    }
  }

  // Method untuk menghentikan kamera
  private hentikanKamera() {
    if (this.aliranKamera) {
      this.aliranKamera.getTracks().forEach((track) => track.stop());
    }
    if (this.intervalDeteksi) {
      clearInterval(this.intervalDeteksi);
    }
  }
}
