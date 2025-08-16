# 🚀 GitHub Repository Setup

## Step 1: Create GitHub Repository

### Quick Method (Open in Browser):
1. Click this link to create a new repo: https://github.com/new
2. Fill in:
   - **Repository name**: `we1web` or `WE1WEB`
   - **Description**: "Revolutionary distributed AI compute platform - Turn devices into a global supercomputer"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Update Git Remote

After creating the repository, GitHub will show you the repository URL. Use one of these formats:

### For HTTPS (easier, no SSH setup needed):
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/we1web.git
```

### For SSH (if you have SSH keys set up):
```bash
git remote remove origin
git remote add origin git@github.com:YOUR_USERNAME/we1web.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Push to GitHub

```bash
git push -u origin main
```

If you get an error about authentication:
- For HTTPS: It will ask for username and password (use a Personal Access Token as password)
- For SSH: Make sure your SSH keys are set up

## Step 4: Verify

Go to your repository: `https://github.com/YOUR_USERNAME/we1web`

You should see all your files uploaded!

## 🔐 GitHub Personal Access Token (if needed)

If using HTTPS and GitHub asks for authentication:

1. Go to: https://github.com/settings/tokens/new
2. Give it a name: "WE1WEB Deploy"
3. Select scopes:
   - ✅ repo (all)
   - ✅ workflow
4. Click "Generate token"
5. Copy the token (you won't see it again!)
6. Use this token as your password when pushing

## 📝 Example Commands

If your GitHub username is `yassine-23`, the commands would be:

```bash
# Remove old remote
git remote remove origin

# Add new remote (choose one)
git remote add origin https://github.com/yassine-23/we1web.git
# OR
git remote add origin git@github.com:yassine-23/we1web.git

# Push to GitHub
git push -u origin main
```

## 🎯 Next Steps After GitHub

Once pushed to GitHub, you can:

1. **Deploy to Render**:
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub account
   - Select your `we1web` repository
   - Render will auto-detect the `render.yaml` file
   - Add environment variables from `.env`
   - Deploy!

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Import GitHub repository
   - Configure environment variables
   - Deploy!

3. **Deploy to Railway**:
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select repository
   - Add variables
   - Deploy!

## 🆘 Troubleshooting

**"Permission denied (publickey)"**
- You need to set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**"Authentication failed"**
- Use a Personal Access Token instead of password
- Make sure you have the right permissions

**"Repository not found"**
- Make sure you created the repository on GitHub first
- Check the repository name and your username are correct

---

Ready to make your project live! 🚀