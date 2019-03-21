<template>

</template>

<script>
  import { options } from "@/mixins";

  export default {
    name   : "options.vue",
    mixins : [ options ],
    methods: {
      log (){
        console.log("inner-options:", this.inner_options);
      }
    }
  }
</script>
