官方给出的生成token方法
```java
public String createAccessToken(String uid,String accessKey,String accessSecret){
      SecretKey secretKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
      JwtBuilder builder = Jwts.builder();
      builder.claim("role","role.visit");
      builder.claim("visitId",StringUtil.trimToEmpty(visitId));//业务方userId(不同用户切记不可重复,否则会话记忆可能穿插)
      builder.claim("visitName",StringUtil.trimToEmpty(visitName));
      builder.claim("timestamp",System.currentTimeMillis());//务必传系统当前时间，会用于系统时间钟校验
      builder.setExpiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000));//建议设置为24小时以内的有效期
      return accessKey + "@" + builder.signWith(secretKey).compact();
}
```
让GPT使用JS重写这个方法（需要安装 jsonwebtoken 依赖）（uid 似乎没有用到，不过这段代码生成的 token 是可以使项目运行的）
```js
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
const accessKey = 'accessKey';
const accessSecret = 'yourSecretKey';
const accessToken = createAccessToken(uid, accessKey, accessSecret);
console.log(accessToken);
```