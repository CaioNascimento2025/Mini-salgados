// limpar nome
function limparNome(nome){

if(typeof nome !== "string") return ""

return nome
.replace(/<[^>]*>?/gm,"")
.replace(/[^\p{L}\s]/gu,"")
.trim()
.slice(0,40)

}

// limpar rua
function limparRua(rua){

if(typeof rua !== "string") return ""

return rua
.replace(/<[^>]*>?/gm,"")
.replace(/[^\p{L}\p{N}\s.,-]/gu,"")
.trim()
.slice(0,80)

}

// banco de produtos seguro
const PRODUTOS = {

s1:{nome:"Coxinha de Frango",preco:5.00},
s2:{nome:"Kibe Recheado",preco:6.00},
s3:{nome:"Enroladinho Salsicha",preco:4.50},
s4:{nome:"Risole de Queijo",preco:5.00},

r1:{nome:"Coca-Cola Lata",preco:5.50},
r2:{nome:"Guaraná 600ml",preco:7.00},
r3:{nome:"Suco de Laranja",preco:8.00},

c1:{nome:"Combo Individual",preco:14.00},
c2:{nome:"Combo Família",preco:45.00}

}

exports.handler = async (event) => {

// 🔒 PROTEÇÃO 1 — origem
const origem = event.headers.origin || ""
const referer = event.headers.referer || ""

if(
 !origem.includes("cardapio-curio.netlify.app") &&
 !referer.includes("cardapio-curio.netlify.app")
){
 return {
  statusCode:403,
  body:JSON.stringify({
   sucesso:false,
   erro:"Acesso bloqueado"
  })
 }
}


// 🔒 PROTEÇÃO 2 — payload gigante
if(event.body.length > 2000){
 return {
  statusCode:400,
  body:JSON.stringify({
   sucesso:false,
   erro:"Requisição inválida"
  })
 }
}

try{

const dados = JSON.parse(event.body)

const nomeCliente = limparNome(dados.nome)
const ruaCliente = limparRua(dados.rua)
const itens = dados.itens


if(!nomeCliente){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Nome inválido"
})
}
}


if(!ruaCliente){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Endereço inválido"
})
}
}


if(!Array.isArray(itens) || itens.length === 0){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Carrinho vazio"
})
}
}


if(itens.length > 30){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Itens demais"
})
}
}


let total = 0
let totalItens = 0

const itensValidados = []


for(const item of itens){

const {id,qtd} = item


if(!PRODUTOS[id]){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Produto inválido"
})
}
}


if(!Number.isInteger(qtd) || qtd <= 0){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Quantidade inválida"
})
}
}


if(qtd > 50){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Quantidade muito grande"
})
}
}


const produto = PRODUTOS[id]
const subtotal = produto.preco * qtd

total += subtotal
totalItens += qtd


itensValidados.push({
nome:produto.nome,
qtd:qtd,
subtotal:subtotal.toFixed(2)
})

}


if(totalItens > 100){
return {
statusCode:400,
body:JSON.stringify({
sucesso:false,
erro:"Pedido muito grande"
})
}
}


// retorno seguro
return {
statusCode:200,
body:JSON.stringify({
sucesso:true,
cliente:nomeCliente,
rua:ruaCliente,
itens:itensValidados,
total:total.toFixed(2)
})
}

}catch(error){

return {
statusCode:500,
body:JSON.stringify({
sucesso:false,
erro:"Erro no servidor"
})
}

}

}
