<template>
  <div>
    <h1>Welcome to GameShop</h1>
    <p><router-link to="/login"><input type="button" value="Login" name="login" class="button" id="login"></router-link></p>
    <p><router-link to="/register"><input type="button" value="Signup" name="signup" class="button" id="signup"></router-link> </p>
    <p><router-link to="/main"><input type="button" value="Skip" name="skip" class="button"></router-link> </p>
    <p><sub>@Qi021212</sub></p>
  </div>
</template>

<script setup>

</script>

<style scoped>
h1 {
  color: #ffffff;
}
div {
  text-align: center;
  width: 400px;
  height: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  padding: 50px 0;
}
.button {
  background-color: #ffffff;
  color: #171d25;
  border-style:inset;
  border-radius: 10px;
  height: 50px;
  width: 180px;
  font-size: 15px;
}

.button:hover {
  background-color: lightsteelblue;
  color: #ffffff;
}
</style>