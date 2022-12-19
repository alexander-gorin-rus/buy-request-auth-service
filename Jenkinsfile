#!/groovy
pipeline {
   options {
       skipDefaultCheckout true
   }
  environment {
     APP_NAME = 'BuyRequest/auth-service'
     WORKSPACE = '/home/Jenkins/workspace/BuyRequest/auth-service'
  }
   agent none
   stages {
       stage('Preflight check'){
           agent {node {label 'master' }}
           when {
                branch 'dev'
            }
           post {
               success {
                   slackSend channel: 'jenkins-buyrequest', \
                   teamDomain: 'umbrellaitcom', \
                   color: '#5cb589', \
                   message: "${env.APP_NAME} - start update- ${env.JOB_BASE_NAME} ${env.BUILD_DISPLAY_NAME} Started (<${env.RUN_DISPLAY_URL}|Open>)",
                   tokenCredentialId: 'umbrella.devops-slack-integration-token'
               }
           }
           steps {
               sh "env | sort"
           }
       }

        stage('Deliver to DEV env'){
            agent {node {label 'master'}}
            when {
                branch 'dev'
            }
            steps {
                script {
                    sshagent (credentials: ['buyrequestdev']) {
                        sh 'ssh -o StrictHostKeyChecking=no -l ubuntu buyrequest-dev.umbrellait.tech \
                        "cd /home/ubuntu/buy-request/docker \
                        && git checkout -f && git pull \
                        && docker run --rm -v ~/buy-request/docker:/ansible buy-request-ansible:latest decrypt ./.env.dev.enc --output=.env \
                        && sudo chown ubuntu .env \
                        && cat .env \
                        && cd ../services/auth-service && git checkout -f && git pull \
                        && cd /home/ubuntu/buy-request/docker && make auth-service-restart && make nginx-restart \
                        && make auth-service-logs-without-tail \
                        && docker system prune -f"'
                    }
                }
            }
        }

        stage('Deliver to PROD env'){
            agent {node {label 'master'}}
            when {
                branch 'master'
            }
            steps {
                script {
                    sshagent (credentials: ['buyrequestprod']) {
                        sh 'ssh -o StrictHostKeyChecking=no -l ubuntu buyrequest-prod.umbrellait.tech \
                        "cd /home/ubuntu/buy-request/docker \
                        && git checkout -f && git pull \
                        && docker run --rm -v ~/buy-request/docker:/ansible buy-request-ansible:latest decrypt ./.env.prod.enc --output=.env \
                        && sudo chown ubuntu .env \
                        && cat .env \
                        && cd ../services/auth-service && git checkout -f && git pull \
                        && cd /home/ubuntu/buy-request/docker && make auth-service-restart && make nginx-restart \
                        && make auth-service-logs-without-tail \
                        && docker system prune -f"'
                    }
                }
            }
        }
   }
   post {
       success {
           slackSend channel: 'jenkins-buyrequest', \
           teamDomain: 'umbrellaitcom', \
           color: '#5cb589', \
           message: "${env.APP_NAME} - ${env.JOB_BASE_NAME} ${env.BUILD_DISPLAY_NAME} Success! (<${env.RUN_DISPLAY_URL}|Open>)", \
           tokenCredentialId: 'umbrella.devops-slack-integration-token'
       }
       failure {
           slackSend channel: 'jenkins-buyrequest', \
           teamDomain: 'umbrellaitcom', \
           color: '#951d13', \
           message: "${env.APP_NAME} - ${env.JOB_BASE_NAME} ${env.BUILD_DISPLAY_NAME} Failed! (<${env.RUN_DISPLAY_URL}|Open>)", \
           tokenCredentialId: 'umbrella.devops-slack-integration-token'
       }
   }
}
