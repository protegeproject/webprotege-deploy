<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "header">
    <#elseif section = "form">
        <div id="kc-logout-confirm" class="content-area">
            <form id="kc-logout-form" class="form-actions" action="${url.logoutConfirmAction}" method="POST">
                <input type="hidden" name="session_code" value="${logoutConfirm.code}">
                <input type="hidden" name="confirmLogout" value="true">
            </form>
        </div>
        <script>document.getElementById('kc-logout-form').submit();</script>
    </#if>
</@layout.registrationLayout>
