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
const accessKey = 'next6602d484f39da553d0977600';
const accessSecret = 'c8fN4ZhYL8J3bnenAmVnyp5nw6-lM9d7UjJAskKxoW';
const accessToken = createAccessToken(uid, accessKey, accessSecret);
console.log(accessToken);