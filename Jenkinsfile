pipeline {
  agent none
  options { timestamps(); timeout(time: 20, unit: 'MINUTES') }
  environment {
    IMAGE = "registry.local/ticketflow:${env.GIT_COMMIT.take(8)}"
  }
  stages {

    stage('Lint') {
      agent { docker { image 'node:20.11-alpine' } }
      steps { sh 'npm ci' ; sh 'npx eslint .' }
    }

    stage('Secrets') {
      agent { docker { image 'zricethezav/gitleaks:v8.18.4' } }
      steps { sh 'gitleaks detect --no-banner --redact --exit-code 1' }
    }

    stage('Quality gates') {
      parallel {
        stage('Test') {
          agent { docker { image 'node:20.11-alpine' } }
          steps { sh 'npm ci' ; sh 'npm test -- --coverage' }
        }
        stage('SAST') {
          agent { docker { image 'returntocorp/semgrep:latest' } }
          steps { sh 'semgrep --config=auto --severity ERROR --error' }
        }
        stage('SCA deps') {
          agent { docker { image 'aquasec/trivy:0.50.1' } }
          steps {
            sh 'trivy fs --severity CRITICAL --exit-code 1 .'
            sh 'trivy fs --format cyclonedx --output sbom.json .'
          }
          post { always { archiveArtifacts artifacts: 'sbom.json' } }
        }
      }
    }

    stage('Build & scan image') {
      agent any
      steps {
        sh 'docker build -t $IMAGE .'
        sh 'trivy image --severity CRITICAL --exit-code 1 $IMAGE'
      }
    }

    stage('Deploy dev') {
      agent any
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'registry-creds',
            usernameVariable: 'REG_USER', passwordVariable: 'REG_PWD')]) {
          sh 'echo "$REG_PWD" | docker login -u "$REG_USER" --password-stdin registry.local'
          sh 'docker push $IMAGE'
        }
      }
    }
  }
  post { failure { echo 'Build bloque : une porte de securite a echoue.' } }
}
