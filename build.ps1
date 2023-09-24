$buildDir = "./build"
$stagingDir = "$buildDir/death_chests"
New-Item -ItemType Directory -Path "./" -Name $buildDir -Force
New-Item -ItemType Directory -Path $stagingDir -Force
Copy-Item -Recurse -Force -Path "./scripts" -Destination $stagingDir
Copy-Item -Path "./pack_icon.png" -Destination $stagingDir
Copy-Item -Path "./manifest.json" -Destination $stagingDir
Compress-Archive -Path $stagingDir -Destination "./death_chests.zip" -Force
Move-Item -Path "./death_chests.zip" -Destination "./death_chests.mcaddon" -Force