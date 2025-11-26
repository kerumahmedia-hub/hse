document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('temuanForm');
    const resultDiv = document.getElementById('result');
    const captureBtn = document.getElementById('captureBtn');
    const canvas = document.getElementById('canvas');
    const preview = document.getElementById('preview');
    const fotoInput = document.getElementById('foto');

    let capturedImage = null;

    // Fungsi untuk capture foto dari kamera
    captureBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            document.body.appendChild(video);
            video.style.display = 'none';

            setTimeout(() => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                capturedImage = canvas.toDataURL('image/png');
                preview.src = capturedImage;
                preview.style.display = 'block';
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(video);
            }, 2000);
        } catch (error) {
            alert('Gagal mengakses kamera: ' + error.message);
        }
    });

    // Handle file upload
    fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                capturedImage = reader.result;
                preview.src = capturedImage;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Submit form
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            id: Date.now().toString(), // ID unik berdasarkan timestamp
            namaInspector: document.getElementById('namaInspector').value,
            hasilTemuan: document.getElementById('hasilTemuan').value,
            lokasiTemuan: document.getElementById('lokasiTemuan').value,
            picArea: document.getElementById('picArea').value,
            kategori: document.getElementById('kategori').value,
            aspek: document.getElementById('aspek').value,
            parameter: document.getElementById('parameter').value,
            foto: capturedImage,
            status: 'Open', // Status otomatis "Open"
            timestamp: new Date().toISOString()
        };

        // Simpan ke localStorage sebagai simulasi database
        let temuanList = JSON.parse(localStorage.getItem('temuanList')) || [];
        temuanList.push(data);
        localStorage.setItem('temuanList', JSON.stringify(temuanList));

        // Opsi: Kirim ke GitHub API (ganti dengan token dan repo Anda)
        // sendToGitHub(data);

        resultDiv.innerHTML = `<div class="alert alert-success">Data berhasil disimpan! ID Lapor: ${data.id}, Status: ${data.status}</div>`;
        form.reset();
        preview.style.display = 'none';
        capturedImage = null;
    });

    // Fungsi untuk mengirim data ke GitHub sebagai file JSON (opsional)
    async function sendToGitHub(data) {
        const token = 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'; // Ganti dengan token Anda
        const repo = 'username/repo-name'; // Ganti dengan repo Anda
        const path = `data/${data.id}.json`;

        const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Add temuan data',
                content: btoa(JSON.stringify(data)) // Encode base64
            })
        });

        if (response.ok) {
            console.log('Data dikirim ke GitHub');
        } else {
            console.error('Gagal mengirim ke GitHub');
        }
    }
});
