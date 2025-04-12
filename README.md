# dompet-web  

A React-based Vite dashboard that displays and manage personal transactions, allowing users to attach files, tag locations and organizae transactions into groups. This is powered by an API backend from [dompet](https://github.com/cchernn/dompet).  

## Installation  

#### 1. Clone the repository  

``` bash
git clone https://github.com/cchernn/dompet-web.git  
cd dompet-web  
```

#### 2. Install dependencies  

``` bash
npm install  
```

#### 3. Setup AWS Cognito  

Follow the steps [here](https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-user-pools.html).  

## Setup  

#### 1. Environment Configuration  

Create a `.env` with the following variables  

- `VITE_COGNITO_USERPOOLID`  
- `VITE_COGNITO_CLIENTID`  
- `VITE_REGION`  
- `VITE_API_BASE_URL`  

## Usage  

```
npm run dev  
```

Visit `http://localhost:5173` in your local browser to start using.  

## API Reference  

This app consumes endpoints from [dompet](https://github.com/cchernn/dompet) API. You can find the full list of supported endpoints in its README.  

## Roadmap  

- Pagination for transactions, attachments and locations page.  
- Overview page.  
- Profile page.  
- Colors, and Light/Dark themes.  
- Mobile-friendly tables.  


## Contact  

cchernn@gmail.com  
