import {HttpException, HttpStatus} from "@nestjs/common";

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new HttpException({
            message: ['Only image files are allowed!']
        }, HttpStatus.BAD_REQUEST), false);
    }
    callback(null, true);
};

