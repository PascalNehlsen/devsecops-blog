---
id: api-only-xss
title: API Only XSS
sidebar_label: API Only XSS
sidebar_position: 2
---

# API-only XSS Challenge Report

:::danger[Only for Testing Purposes]
This tool is intended for educational and authorized penetration testing purposes only. Unauthorized use of this tool against systems that you do not have explicit permission to test is illegal and unethical.
:::

**Project**: OWASP Juice Shop - API-only XSS Challenge (XSS) <br/ >
**Tools**: Kali Linux with Burp Suite <br/ >
**Author**: Pascal Nehlsen <br/ >
**Portfolio**: [https://www.pascal-nehlsen.de/](https://www.pascal-nehlsen.de/) <br/ >
**GitHub Link**: [https://github.com/PascalNehlsen/juice-shop-challenges/blob/main/challenges/api-only-xss.md](https://github.com/PascalNehlsen/juice-shop-challenges/blob/main/challenges/api-only-xss.md)

## Table of Contents

1. [Introduction](#Introduction)
2. [Objective](#Objective)
3. [Approach](#Approach)
   - [Step 1: Information Gathering](#step-1-information-gathering)
   - [Step 2: Analyzing API Endpoints](#step-2-analyzing-api-endpoints)
   - [Step 3: Injecting XSS Payload](#step-3-injecting-xss-payload)
4. [Conclusion](#Conclusion)

### Introduction

The OWASP Juice Shop is a deliberately vulnerable web application designed to demonstrate security issues, including Cross-Site Scripting (XSS). This report details the steps I followed to complete the API-only XSS challenge.

### Objective

The objective of this challenge was to exploit an XSS vulnerability through the API endpoints of the Juice Shop application. The approach involved embedding malicious scripts into a product's description to see if these would execute in the browser. Successfully completing the challenge required persisting an XSS payload within the application.

### Approach

#### Step 1: Information Gathering

To identify where persistent data is stored within the shop, I examined product descriptions as a likely target. Using Burp Suite's "Intercept" feature, I intercepted the HTTP requests within the application to analyze the API calls involved.

<div align="center">

![Information Gathering](../../../assets/images/juice-shop/api-only-xss/information.png)

</div>

Upon reviewing the HTTP history, I found a `GET` request to `/api/Quantitys/`. I then sent this request to Burp Suite's Repeater tool for modification. By changing the API endpoint to `/api/Products/`, I accessed a complete JSON response containing all product details.

Sample Product in JSON Format:

```json
{
  "id": 1,
  "name": "Apple Juice (1000ml)",
  "description": "The all-time classic.",
  "price": 1.99,
  "deluxePrice": 0.99,
  "image": "apple_juice.jpg",
  "createdAt": "2024-10-24T10:01:58.486Z",
  "updatedAt": "2024-10-24T10:01:58.486Z",
  "deletedAt": null
}
```

#### Step 2: Analyzing API Endpoints

After identifying the product data, I further explored the Juice Shop API endpoints. By sending an `OPTIONS` request to `/api/Products/`, I confirmed that the API supports standard HTTP methods (GET, POST, PUT, PATCH).

```bash
OPTIONS /api/Products/ HTTP/1.1
```

Since attempts to update product data with the `PATCH` method were unsuccessful (resulting in a 500 status code), I opted to use the `PUT` method, which replaces data in its entirety. Additionally, I set the `Content-Type` to `application/json`, as the GET response data format was JSON. With IDs listed in the JSON data, I accessed the first product directly via `/api/products/1`.

I first tested updating the product description without any XSS payload:

**PUT Request to Update Product Description**

```bash
PUT /api/products/1 HTTP/1.1
Host: 127.0.0.1:3000
Content-Type: application/json
Connection: keep-alive

{
"description": "OWASP is King"
}
```

The server responded with a 200 status code, confirming the update:

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Apple Juice (1000ml)",
    "description": "OWASP is King",
    "price": 1.99,
    "deluxePrice": 0.99,
    "image": "apple_juice.jpg",
    "createdAt": "2024-10-24T10:01:58.486Z",
    "updatedAt": "2024-10-24T11:06:53.363Z",
    "deletedAt": null
  }
}
```

On checking the OWASP Juice Shop UI, the product description was successfully updated.

<div align="center">

![New Product](../../../assets/images/juice-shop/api-only-xss/new-product.png)

</div>

#### Step 3: Injecting XSS Payload

To complete the challenge, I attempted to add an iframe to the description with a JavaScript payload:

```json
{
  "description": "<iframe src=\"javascript:alert(`xss`)\">"
}
```

When testing without escaped double quotes, the server returned a 500 error due to syntax issues. Adding backslashes before the double quotes (`\"`) allowed the payload to be processed, resulting in a 200 status code.

Upon refreshing the OWASP Juice Shop page, I observed the modified product description. The XSS payload executed as intended when viewing the product, confirming the successful exploitation of the XSS vulnerability.

<div align="center">

![Information Gathering](../../../assets/images/juice-shop/api-only-xss/result.png)

</div>

### Conclusion

This test successfully completed the API-only XSS Challenge by embedding a persistent XSS payload in the description of the Apple Juice product through a direct API request, bypassing the web frontend.

<div align="center">

![Challenge Accepted](../../../assets/images/juice-shop/api-only-xss/challenge-accept.png)

</div>
