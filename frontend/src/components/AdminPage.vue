<template>
    <div id="adminpage">
        <h2>{{ pageContent }}</h2>
    </div>
</template>

<script>
import {AXIOS} from '@/common/http-client'

export default {
    name: 'AdminPage',
    data() {
        return {
            pageContent: ''
        }
    },
    methods: {
        loadUserContent() {
            const header = {'Authorization': 'Bearer ' + this.$store.getters.getToken};
            AXIOS.get('/admincontent', { headers: header })
            .then(response => {
                this.$data.pageContent = response.data;
            })
            .catch(error => {
                console.log('ERROR: ' + error.response.data);
            })
        }
    },
    mounted() {
        this.loadUserContent();
    }
}
</script>

<style>
</style>