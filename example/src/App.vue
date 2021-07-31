<template>
  <div id="app">
    <font-awesome-icon icon="user-secret" />
    <font-awesome-icon :icon="['fas', 'user-secret']" />

    <!-- Customized syntax -->
    <!-- <fa icon="far-music" /> -->

    <!-- Duotone params are supported if you have pro-duotone-svg-icons -->
    <!-- <fa icon="fad-user-secret" primaryColor="blue" secondaryColor="white" /> -->
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>
