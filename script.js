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
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri('/models')
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
    ).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    const resizeDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext("2d").clearRect(0,0,canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizeDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
    resizeDetections.forEach( detection => {
      const box = detection.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
      drawBox.draw(canvas)
    })
  }, 100)
})