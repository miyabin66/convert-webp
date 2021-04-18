const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const imagesPath = './images/' // 変換する画像が入ったフォルダ

const deleteFileList = [] // 削除するwebpファイルを入れる配列
const convertFileList = [] // 変換する画像ファイルを入れる配列

const getFileType = (path) => {
  try {
    const stat = fs.statSync(path)

    switch (true) {
      case stat.isFile():
        return 'File'

      case stat.isDirectory():
        return 'Directory'

      default:
        return 'Other'
    }
  } catch (e) {
    throw new Error('File type unknown.')
  }
}

const listFiles = (dirPath) => {
  const fileName = fs.readdirSync(dirPath)
  fileName.forEach((image) => {
    const absPath = `${dirPath}/${image}`
    switch (getFileType(absPath)) {
      case 'File':
        if (absPath.includes('.webp')) {
          deleteFileList.push(absPath)
        } else if (
          absPath.includes('.png') ||
          absPath.includes('.jpg') ||
          absPath.includes('.jpeg')
        ) {
          convertFileList.push(absPath)
        }
        break

      case 'Directory':
        listFiles(absPath)
        break

      default:
        break
    }
  })
}

/**
 * 元画像のファイル情報を読み取ってWebPに変換する関数を実行
 */
function convertFiles() {
  convertFileList.forEach((absPath) => {
    // 画像ファイルを抜き出す 'hoge.png'
    const image = absPath.split('/').reverse()[0]
    // 画像ファイル名を抜き出す 'hoge'
    const imageName = image.split('.')[0]
    // 画像ファイルより階層が上の絶対パスを抜き出す 'pc/sample/hoge/'
    const path = absPath.replace(image, '')
    // 画像ファイル名.webpで出力
    sharp(absPath)
      .webp({
        quality: 75,
      })
      .toFile(`${path}${imageName}.webp`, (err) => {
        if (err) return err
      })
  })
}

/**
 * ファイルを削除する関数
 */
function deleteFiles() {
  return new Promise((resolve, reject) => {
    try {
      deleteFileList.forEach((item) => {
        fs.unlinkSync(item)
      })
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * ファイルを探す関数
 */
function searchFiles() {
  return new Promise((resolve, reject) => {
    try {
      const dirPath = path.resolve(imagesPath)
      listFiles(dirPath)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

async function init() {
  // 変換するファイルを探す
  await searchFiles()
  // フォルダ内に既に存在するwebp画像を全て削除する
  await deleteFiles()
  // webp変換
  await convertFiles()
}

init()
