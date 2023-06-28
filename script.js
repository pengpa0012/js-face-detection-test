const video = document.querySelector("#camera")
const cover = document.querySelector("#cover")
const constraints = {
  audio: false,
  video: true,
};
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(startCamera)

function startCamera() {
  navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream
  })
  .catch(console.error)
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  cover.append(canvas)
  const displaySize = { width: video.videoWidth, height: video.videoHeight }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceExpressions()
    console.log(detections, displaySize, video.videoWidth)
    const resizeDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext("2d").clearRect(0,0,canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizeDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
  }, 100)
})