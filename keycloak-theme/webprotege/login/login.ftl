<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
    <#elseif section = "form">
        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
            <div class="wp-form-group">
                <label for="username" class="wp-label">
                    <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                </label>
                <input tabindex="1" id="username" class="wp-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
                <#if messagesPerField.existsError('username','password')>
                    <span class="wp-input-error" aria-live="polite">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</span>
                </#if>
            </div>

            <div class="wp-form-group">
                <label for="password" class="wp-label">
                    ${msg("password")}
                </label>
                <input tabindex="2" id="password" class="wp-input" name="password" type="password" autocomplete="current-password" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>" />
            </div>

            <div class="wp-form-group wp-form-options">
                <#if realm.rememberMe && !usernameHidden??>
                    <label class="wp-checkbox-label">
                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>> ${msg("rememberMe")}
                    </label>
                </#if>
            </div>

            <div class="wp-form-group">
                <input tabindex="4" class="wp-submit-btn" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}" />
            </div>

            <#if realm.resetPasswordAllowed>
                <div class="wp-forgot-password">
                    <a tabindex="5" href="${url.loginResetCredentialsUrl}">Forgot username or password?</a>
                </div>
            </#if>
        </form>
    <#elseif section = "info">
    </#if>
</@layout.registrationLayout>
