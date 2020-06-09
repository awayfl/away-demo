import {Matrix3D, Vector3D, Orientation3D} from "@awayjs/core";

console.log("PATH DECOMPOSE");

Matrix3D.prototype.decompose = function decompose(orientationStyle:string = "eulerAngles"):Vector3D[]
{
    if (this._components == null)
        this._components = [new Vector3D(), new Vector3D(), new Vector3D(), new Vector3D()];

    var colX:Vector3D = new Vector3D(this._rawData[0], this._rawData[1], this._rawData[2]);
    var colY:Vector3D = new Vector3D(this._rawData[4], this._rawData[5], this._rawData[6]);
    var colZ:Vector3D = new Vector3D(this._rawData[8], this._rawData[9], this._rawData[10]);

    var scale:Vector3D = this._components[3];
    var skew:Vector3D = this._components[2];

    //compute X scale factor and normalise colX
    scale.x = colX.length;
    colX.scaleBy(1 / scale.x);

    //compute XY shear factor and make colY orthogonal to colX
    skew.x = colX.dotProduct(colY);
    colY = Vector3D.combine(colY, colX, 1, -skew.x);

    //compute Y scale factor and normalise colY
    scale.y = colY.length;
    colY.scaleBy(1 / scale.y);
    skew.x /= scale.y;

    //compute XZ and YZ shears and make colZ orthogonal to colX and colY
    skew.y = colX.dotProduct(colZ);
    colZ = Vector3D.combine(colZ, colX, 1, -skew.y);
    skew.z = colY.dotProduct(colZ);
    colZ = Vector3D.combine(colZ, colY, 1, -skew.z);

    //compute Z scale and normalise colZ
    scale.z = colZ.length;
    colZ.scaleBy(1 / scale.z);
    skew.y /= scale.z;
    skew.z /= scale.z;

    if(scale.z < 0) {
        
        debugger;
        scale.z = -scale.z;
        scale.y = -scale.y;
    }

    //at this point, the matrix (in cols) is orthonormal
    //check for a coordinate system flip. If the determinant is -1, negate the z scaling factor
    if (colX.dotProduct(colY.crossProduct(colZ)) < 0) {
        scale.z = -scale.z;
        colZ.x = -colZ.x;
        colZ.y = -colZ.y;
        colZ.z = -colZ.z;
    }

    var rot = this._components[1];

    switch (orientationStyle) {
        case Orientation3D.AXIS_ANGLE:

            rot.w = Math.acos((colX.x + colY.y + colZ.z - 1) / 2);

            var len:number = Math.sqrt((colY.z - colZ.y) * (colY.z - colZ.y) + (colZ.x - colX.z) * (colZ.x - colX.z) + (colX.y - colY.x) * (colX.y - colY.x));
            rot.x = (colY.z - colZ.y) / len;
            rot.y = (colZ.x - colX.z) / len;
            rot.z = (colX.y - colY.x) / len;

            break;
        case Orientation3D.QUATERNION:

            var tr = colX.x + colY.y + colZ.z;

            if (tr > 0) {
                rot.w = Math.sqrt(1 + tr) / 2;

                rot.x = (colY.z - colZ.y) / (4 * rot.w);
                rot.y = (colZ.x - colX.z) / (4 * rot.w);
                rot.z = (colX.y - colY.x) / (4 * rot.w);
            } else if ((colX.x > colY.y) && (colX.x > colZ.z)) {
                rot.x = Math.sqrt(1 + colX.x - colY.y - colZ.z) / 2;

                rot.w = (colY.z - colZ.y) / (4 * rot.x);
                rot.y = (colX.y + colY.x) / (4 * rot.x);
                rot.z = (colZ.x + colX.z) / (4 * rot.x);
            } else if (colY.y > colZ.z) {
                rot.y = Math.sqrt(1 + colY.y - colX.x - colZ.z) / 2;

                rot.x = (colX.y + colY.x) / (4 * rot.y);
                rot.w = (colZ.x - colX.z) / (4 * rot.y);
                rot.z = (colY.z + colZ.y) / (4 * rot.y);
            } else {
                rot.z = Math.sqrt(1 + colZ.z - colX.x - colY.y) / 2;

                rot.x = (colZ.x + colX.z) / (4 * rot.z);
                rot.y = (colY.z + colZ.y) / (4 * rot.z);
                rot.w = (colX.y - colY.x) / (4 * rot.z);
            }

            break;
        case Orientation3D.EULER_ANGLES:

            rot.y = Math.asin(-colX.z);

            //var cos:number = Math.cos(rot.y);

            if (colX.z != 1 && colX.z != -1) {
                rot.x = Math.atan2(colY.z, colZ.z);
                rot.z = Math.atan2(colX.y, colX.x);
            } else {
                rot.z = 0;
                rot.x = Math.atan2(colY.x, colY.y);
            }

            break;
    }

    this._components[0].copyFrom(this.position);

    return this._components;
}