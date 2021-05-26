import {
    registerDecorator,
} from "class-validator";
import config from "../../configuration/config";


export function IsImage() {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isImage',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: `${propertyName} must have one of these extensions : ${config.authorizedImageFormats.join(', ')}`
            },
            validator: {
                validate(value: any) {
                    const regx = /(?:\.([^.]+))?$/
                    const ext = regx.exec(value)[1]
                    return ext && config.authorizedImageFormats.includes(ext);
                },
            },
        });
    }
}
