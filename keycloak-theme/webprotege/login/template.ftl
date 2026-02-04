<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
</head>
<body class="wp-login-page">

    <#-- Sign up button top-right -->
    <#if realm.registrationAllowed && !registrationDisabled??>
        <div class="wp-signup-bar">
            <a href="${url.registrationUrl}" class="wp-signup-btn">Sign up for account</a>
        </div>
    </#if>

    <div class="wp-login-container">
        <#-- Logo -->
        <div class="wp-logo">
            <img src="${url.resourcesPath}/img/webprotege-logo.png" alt="WebProtege" />
        </div>

        <#-- Heading -->
        <h1 class="wp-heading">Please sign in to continue</h1>

        <#-- Show username (used in OTP / review profile pages) -->
        <#if displayRequiredFields>
            <div class="wp-required-fields">
                <div class="wp-required-fields-text">
                    <span class="required">*</span> ${msg("requiredFields")}
                </div>
            </div>
        </#if>

        <div class="wp-card">
            <#-- Header section (used by some pages like OTP) -->
            <#if auth?has_content && auth.showUsername()>
                <div class="wp-show-username">
                    <div class="wp-username-display">
                        <span>${auth.attemptedUsername}</span>
                        <a id="reset-login" href="${url.loginRestartFlowUrl}" aria-label="${msg('restartLoginTooltip')}">
                            <span class="wp-restart-icon">&larr;</span>
                        </a>
                    </div>
                </div>
            </#if>

            <header class="wp-card-header">
                <#nested "header">
            </header>

            <#-- Alert messages -->
            <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="wp-alert wp-alert-${message.type}">
                    <span class="wp-alert-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <#-- Main form content -->
            <div class="wp-card-body">
                <#nested "form">
            </div>

            <#-- Info section (e.g. "back to login" on register page) -->
            <#if displayInfo>
                <div class="wp-card-info">
                    <#nested "info">
                </div>
            </#if>

            <#-- Social providers -->
            <#if realm.password && social?? && social.providers?has_content>
                <div class="wp-social-providers">
                    <hr />
                    <p>${msg("identity-provider-login-label")}</p>
                    <ul class="wp-social-list">
                        <#list social.providers as p>
                            <li>
                                <a id="social-${p.alias}" class="wp-social-link wp-social-link-${p.providerId}" href="${p.loginUrl}">
                                    <#if p.iconClasses?has_content>
                                        <i class="${p.iconClasses}" aria-hidden="true"></i>
                                    </#if>
                                    <span class="wp-social-link-text">${p.displayName!}</span>
                                </a>
                            </li>
                        </#list>
                    </ul>
                </div>
            </#if>
        </div>
    </div>

    <#-- Footer -->
    <footer class="wp-footer">
        <p>WebProtege is developed by the Protege team in the Biomedical Informatics Research Group (BMIR) at Stanford University, California, USA. The work is supported by Grant GM121724 from the National Institute of General Medical Sciences at the United States National Institutes of Health.</p>
        <p class="wp-footer-links">
            WebProtege 6.0.0 &nbsp;|&nbsp;
            <a href="https://protegewiki.stanford.edu/wiki/WebProtege4Privacy" target="_blank">Privacy Policy</a> &nbsp;|&nbsp;
            <a href="https://protegewiki.stanford.edu/wiki/WebProtege4Terms" target="_blank">Terms of Use</a>
        </p>
    </footer>

</body>
</html>
</#macro>
