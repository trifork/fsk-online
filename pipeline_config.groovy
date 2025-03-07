libraries{
    settings { profile = 'fmk-online' }
    maven 
    docker { 
        output_images = '[{"name":"fmk-online-fsk","image":"registry.fmk.netic.dk/fmkonline/fmk-online-fsk", "user":"fmk-online-fsk"}]'
        java_version = 21 
    }
    sonarqube_maven
}
