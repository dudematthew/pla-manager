const topPlayerTemplate = `
<div style="width: 400px; height: 400px; position: relative; background: linear-gradient(to right, #f9423a, #f9736a); border: none; font-family: 'Roboto', sans-serif; padding: 7px; box-shadow: 10px 10px 20px rgba(0,0,0,0.1);">
<div style="position: absolute; display: box; width: 80px; height: 80px; background: white; border-radius: 50%; left: 50px; top: 25px;">
    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 3.5em; font-weight: bold; color: #ff7e5f;">#1</span>
</div>
<img style="display: none" src="%s"> 
<div class="text-center">
  <img src="%s" class="rounded-circle" style="width: 290px;">
</div>
<h4 class="text-center font-weight-bold mt-2" style="font-size: 2em;">
  %s
</h4>
<span class="text-center d-block" style="color: rgba(36, 48, 31, 0.7); font-size: 1.6em; margin-top: 0;">%s</span>

<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
<style>
body { 
background-color: transparent;
}
</style>`;

interface TopPlayerTemplateParams {
  logoUrl: string;
  avatarImgUrl: string;
  playerName: string;
  playerNickname: string;
}

export { topPlayerTemplate, TopPlayerTemplateParams };