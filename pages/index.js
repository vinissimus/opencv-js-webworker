import { useEffect, useRef, useState } from 'react'
import cv from '../services/cv'

// We'll limit the processing size to 200px.
const maxVideoSize = 200

export default function Page() {
  const [processing, setProcessing] = useState(false)
  const videoElement = useRef(null)
  const canvasEl = useRef(null)

  /**
   * What we will do in the onClick event is capture a frame within
   * the video to pass this image on our service.
   */
  async function onClick() {
    setProcessing(true)

    const ctx = canvasEl.current.getContext('2d')
    ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize)
    const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize)
    // Load the model
    await cv.load()
    // Processing image
    const processedImage = await cv.imageProcessing(image)
    // Render the processed image to the canvas
    ctx.putImageData(processedImage.data.payload, 0, 0)
    setProcessing(false)
  }

  /**
   * In the useEffect hook what we are going to do is load the video
   * element so that it plays what you see on the camera. This way
   * it's like a viewer of what the camera sees and then at any
   * time we can capture a frame to take a picture and upload it
   * to OpenCV.
   */
  useEffect(() => {
    async function setupCamera() {
      videoElement.current.width = maxVideoSize
      videoElement.current.height = maxVideoSize

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: maxVideoSize,
            height: maxVideoSize,
          },
        })
        videoElement.current.srcObject = stream

        return new Promise(resolve => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current)
          }
        })
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera'
      alert(errorMessage)
      return Promise.reject(errorMessage)
    }

    async function load() {
      const videoLoaded = await setupCamera()
      videoLoaded.play()
      return videoLoaded
    }

    load()
  }, [])

  /**
   * What we're going to render is:
   *
   * 1. A video component for the user to see what he sees on the camera.
   *
   * 2. A simple button, that with the onClick we will generate an image of
   *  the video, we will load OpenCV and we will treat the image.
   *
   * 3. A canvas, which will allow us to capture the image of the video
   * while showing the user what image has been taken from the video after
   * pressing the button.
   *
   */
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <video className="video" playsInline ref={videoElement} />
      <button 
        disabled={processing} 
        style={{ width: maxVideoSize, padding: 10 }} 
        onClick={onClick}
      >
        {processing ? 'Processing...' : 'Take a photo'}
      </button>
      <canvas
        ref={canvasEl}
        width={maxVideoSize}
        height={maxVideoSize}
      ></canvas>
    </div>
  )
}
