import multer from 'multer'
import { MediaModel } from '../models/mediaModel.js';


const mediaRoute = (app) => {

    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads');
        },
        filename: function (req, file, cb) {
            const mimetype = file.originalname.split('.').pop()
            cb(null, Date.now() + '.' + mimetype);
        },
    });

    const upload = multer({ storage });

    app.post('/medias/upload', upload.array('images'), async function (req, res) {
        const files = req.files
        try {
            const newFiles = await Promise.all(
                files.map(file => {
                    const mimetype = file.originalname.split('.').pop()
                    return new MediaModel({
                        filename: file?.originalname,
                        mimeType: mimetype,
                        name: file.filename
                    }).save()
                })
            )
            return res.json(newFiles.map(file => file._id))
        } catch (error) {
            console.log(error)
        }
    })
}

export default mediaRoute
