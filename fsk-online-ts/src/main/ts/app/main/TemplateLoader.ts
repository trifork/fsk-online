export default function loadTemplate(templatePath: string) {
    let prefix = "app/";
    if (templatePath.indexOf("app/") > -1 || templatePath.indexOf("common/") > -1) {
        prefix = "";
    }

    return <string>require(`raw-loader!../../${prefix}${templatePath}`);
}
