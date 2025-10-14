pipeline {
  agent any

  options {
    disableConcurrentBuilds()   // prevent overlapping builds
    skipStagesAfterUnstable()   // skip next stages if any stage fails
  }

  environment {
    DOCKERHUB_USER = 'gangadhar369'
    APP_NAME       = 'myapp'
    BACKEND_REPO   = "docker.io/${DOCKERHUB_USER}/${APP_NAME}-backend"
    FRONTEND_REPO  = "docker.io/${DOCKERHUB_USER}/${APP_NAME}-frontend"
    GIT_BRANCH     = 'main'
  }

  triggers {
    githubPush()  // trigger builds on GitHub commits
  }

  stages {
    stage('Check Commit Source') {
      steps {
        script {
          // Get the latest commit message
          def commitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()

          // If Jenkins committed the change itself (like "ci:" or "chore:"), stop here
          if (commitMessage.startsWith("ci:") || commitMessage.startsWith("chore:")) {
            echo "🚫 Skipping build — detected Jenkins auto-commit: '${commitMessage}'"
            currentBuild.result = 'SUCCESS'
            error("Build stopped intentionally to avoid CI loop.")
          } else {
            echo "✅ User commit detected: '${commitMessage}' — continuing pipeline..."
          }
        }
      }
    }

    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Build Backend Image') {
      steps {
        sh '''
          echo "🔧 Building backend Docker image..."
          cd backend
          docker build -t ${BACKEND_REPO}:${GIT_COMMIT} .
          docker tag ${BACKEND_REPO}:${GIT_COMMIT} ${BACKEND_REPO}:latest
        '''
      }
    }

    stage('Build Frontend Image') {
      steps {
        sh '''
          echo "🧩 Building frontend Docker image..."
          cd frontend
          docker build -t ${FRONTEND_REPO}:${GIT_COMMIT} .
          docker tag ${FRONTEND_REPO}:${GIT_COMMIT} ${FRONTEND_REPO}:latest
        '''
      }
    }

    stage('Login to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo "🔐 Logging in to Docker Hub..."
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
          '''
        }
      }
    }

    stage('Push Images to Docker Hub') {
      steps {
        sh '''
          echo "📦 Pushing images to Docker Hub..."
          docker push ${BACKEND_REPO}:${GIT_COMMIT}
          docker push ${BACKEND_REPO}:latest
          docker push ${FRONTEND_REPO}:${GIT_COMMIT}
          docker push ${FRONTEND_REPO}:latest
        '''
      }
    }

    stage('Update Helm Chart Image Tags') {
      steps {
        sh '''
          echo "📝 Updating Helm chart with new image tags..."
          sed -i "s|tag:.*|tag: \\"${GIT_COMMIT}\\"|g" helm-chart/values.yaml
          echo "✅ Helm chart updated with image tag ${GIT_COMMIT}"
        '''
      }
    }

    stage('Commit and Push Changes to Git') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'github-creds', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
          sh '''
            echo "📤 Pushing Helm chart changes to GitHub..."
            git config user.email "ci@myapp.com"
            git config user.name "Jenkins CI"

            git add helm-chart/values.yaml
            git commit -m "ci: update image tag to ${GIT_COMMIT}" || echo "No changes to commit"
            git pull origin ${GIT_BRANCH} --rebase || true
            git push https://${GIT_USER}:${GIT_TOKEN}@github.com/${GIT_USER}/my-app.git HEAD:${GIT_BRANCH}
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Build and push successful! ArgoCD will auto-sync and deploy the new version to EKS."
    }
    failure {
      echo "❌ Build failed! Please check the Jenkins logs for details."
    }
  }
}
