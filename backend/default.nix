{ pkgs }: {
  deps = [
    pkgs.nodejs-19_1_0
    pkgs.libuuid
  ];
  env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid];  }; 
}
