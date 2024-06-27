<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <title>Login - ${realm.name}</title>
    <link rel="stylesheet" type="text/css" href="${url.resourcesPath}/css/styles.css">
    <script src="${url.resourcesPath}/js/scripts.js"></script>
</head>
<body>
    <div id="kc-logo">
        <img src="${url.resourcesPath}/img/logo.png" alt="Logo">
    </div>
    <h1>Login to ${realm.name}</h1>
    <div id="kc-form-wrapper">
        <form id="kc-form-login" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username">${msg("username")}</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">${msg("password")}</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
                <button type="submit">${msg("doLogIn")}</button>
            </div>
        </form>
    </div>
</body>
</html>