({
    baseUrl: "src",
    name: "regula",
    out: "dist/regula-built.js",
    onBuildWrite: function(moduleName, path, contents) {
        return contents.replace(/Version (\d+\.\d+\.\d+)-SNAPSHOT/, function(match, version) {
            return "Version: " + version;
        });
    }
})
