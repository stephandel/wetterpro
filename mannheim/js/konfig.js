/* WetterPro Mannheim – Einstellungen, die ohne neuen Bau änderbar sind.
   Wird nicht in die Einzeldatei eingebaut (data-konfig in index.html), online.py legt sie als mannheim/js/konfig.js daneben.
   WEBCAM_WORKER: Adresse des Bildspeichers (Cloudflare-Worker „wetterpro-webcams“, siehe worker/webcam-archiv/LIESMICH.md),
   z. B. 'https://wetterpro-webcams.<konto>.workers.dev', ohne Schrägstrich am Ende. Leer: Webcams zeigen „Bildspeicher noch
   nicht eingerichtet“, Luftdaten und Flugwetter fehlen. Zum Testen gegen `wrangler dev` geht ?worker=http://127.0.0.1:<Port>
   oder der Browserspeicher „wpma-worker“ (beides nur für localhost-Adressen oder auf einer lokalen Seite). */
var WEBCAM_WORKER = 'https://wetterpro-webcams.stephanhandel.workers.dev';
