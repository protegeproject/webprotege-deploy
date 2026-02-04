<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
    <#elseif section = "form">
        <div id="kc-info-message">
            <p class="wp-logout-message">${message.summary}<#if requiredActions??><#list requiredActions>: <b><#items as reqActionItem>${kcSanitize(msg("requiredAction.${reqActionItem}"))?no_esc}<#sep>, </#items></b></#list><#else></#if></p>
            <#if skipLink??>
            <#else>
                <#if pageRedirectUri?has_content>
                    <div class="wp-card-info">
                        <a href="${pageRedirectUri}">${kcSanitize(msg("backToApplication"))?no_esc}</a>
                    </div>
                <#elseif actionUri?has_content>
                    <div class="wp-card-info">
                        <a href="${actionUri}">${kcSanitize(msg("proceedWithAction"))?no_esc}</a>
                    </div>
                <#elseif (client.baseUrl)?has_content>
                    <div class="wp-card-info">
                        <a href="${client.baseUrl}">${kcSanitize(msg("backToApplication"))?no_esc}</a>
                    </div>
                </#if>
            </#if>
        </div>
        <script>
            if (window.location.href.indexOf('logout') !== -1) {
                window.location.replace('/');
            }
        </script>
    </#if>
</@layout.registrationLayout>
