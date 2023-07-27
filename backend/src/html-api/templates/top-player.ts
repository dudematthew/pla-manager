const topPlayerTemplate = `
<style>
body {
  background-color: transparent;
}
</style>
<div style="width: 240px; height: 240px; position: relative; background: linear-gradient(to right, #f9423a, #f9736a); border: none; font-family: 'Roboto', sans-serif; padding: 20px; border-radius: 20px; box-shadow: 10px 10px 20px rgba(0,0,0,0.1);">
`
// <!-- PLA logo -->
// <img src="%s" style="position: absolute; display: box; width: 35px; height: 35px; right: 15px; top: 15px;">
+`

<div style="position: absolute; display: box; width: 40px; height: 40px; background: white; border-radius: 50%; left: 57px; top: 34px;">
    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.4em; font-weight: bold; color: #ff7e5f;">#1</span>
</div>
<div class="mt-2 p-2 text-center">
  <img src="%s" class="rounded-circle" style="width: 100px;">
</div>
<h4 class="text-center font-weight-bold">
  %s
</h4>
<span class="text-center d-block" style="color: rgba(108, 122, 137, 0.8);">%s</span>
</div>

<!-- Include external CSS, JavaScript or Fonts! -->
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">`;

interface TopPlayerTemplateParams {
  logoUrl: string;
  avatarImgUrl: string;
  playerName: string;
  playerNickname: string;
}

export { topPlayerTemplate, TopPlayerTemplateParams };