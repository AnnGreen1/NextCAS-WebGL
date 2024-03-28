const jwt = require('jsonwebtoken');

function createAccessToken(uid, accessKey, accessSecret) {
    const secretKey = Buffer.from(accessSecret, 'utf8');
    
    const tokenPayload = {
        role: 'role.visit',
        visitId: uid,
        visitName: '',
        timestamp: Date.now(),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 设置为24小时以内的有效期
    };
    
    const token = jwt.sign(tokenPayload, secretKey, { algorithm: 'HS256' });
    
    return accessKey + '@' + token;
}

// 调用函数并输出结果
const uid = '123';
const accessKey = 'next66056c86bf46ee5d997de368';
const accessSecret = '2V_2AblKpNCw2wvQ-eJJRsEqWQjizULX28C09BTF4K';
const accessToken = createAccessToken(uid, accessKey, accessSecret);
console.log(accessToken);