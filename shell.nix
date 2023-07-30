{ pkgs }: {
  deps = [
    pkgs.nodejs-19_1_0
    pkgs.libuuid
  ];
  env = { 
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid]; 
    NODE_ENV = "production";
  }; 
  shellHook = ''
    echo "The .nix file is being used."
    npm run deploy
  '';
}