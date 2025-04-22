<template>
<div class="header">
    <ul class="header">
        <li><a href="mainForm"><img src="/src/assets/logo.png" id="logo" alt="logo"></a></li>
        <li class="header"><router-link to="/">商店</router-link></li>
        <li class="header"><router-link to="/">购物车</router-link></li>
        <li class="header"><router-link to="/">订单</router-link></li>
        <li class="header"><router-link to="/user">个人信息</router-link></li>
        <li class="header"><router-link to="/">日志</router-link></li>
    </ul>
</div>
</template>

<script>
export default{
    name:"Top"
}
</script>

<style scoped>
/*top*/
#logo{
    float: left;
    height: 100px;
    width: 100px;
}
ul.header{
    position: fixed;
    background-color: #171d25;
    list-style-type: none;
    margin: 0;
    padding: 0;
    top: 0;
    width: 100%;
    z-index: 100;
}
li.header{
    display: inline;
    float: left;
    padding-top: 20px;
}
li.header a{
    display: block;
    color: white;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
    font-size: 25px;
}
li.header a:hover{
    color: #0099ff;
}
</style>