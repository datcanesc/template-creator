1-Uygulama başlatılmadan önce ".env" dosyası içerisinden ip ve host gibi ayarlar yapılmalı.

2-Sonrasında eğer keycloak bir docker container'ı içerisindeyse uygulama ile aynı networke bağlantı sağlanmalı , varsayılan olarak docker-compose.yaml dosyası içerisinde "mine" network'üne bağlanacak şekilde ayarlanmıştır. Netwrok adını değiştirmemk için compose dosyasınında değişiklik yapılmalıdır.

3-Gerekli değişiklikler yapıldıktan sora terminale docker compose up --build yazılarak uygulama başlatılabilir, varsayılan olarak 3000 portunda çalışacaktır.