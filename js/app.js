$(document).ready(function () {
  cardapio.eventos.init();

});

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;

var CELULAR_EMPRESA = '5548991732972';
var CELULAR_PESSOAL = '5548991732972';



cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItensCardapio();
    cardapio.metodos.carregarBotaoReserva();
    cardapio.metodos.carregraBotaoLigar();
    cardapio.metodos.carregarConversaWhastapp();
  }
};

cardapio.metodos = {
  // obtem a lista do cardapio
  obterItensCardapio: (categoria = 'burgers', vermais = false) => {

    var filtro = MENU[categoria];
    console.log(filtro)

    // se o botao ver mais não estiver ativo ele limpa os demais itens
    if (!vermais) {
      $("#itensCardapio").html('')
      $("#btnVerMais").removeClass('hidden');
    }


    $.each(filtro, (i, e) => {

      let temp = cardapio.templates.item.replace(/\${img}/g, e.img) // global
        .replace(/\${name}/g, e.name)
        .replace(/\${price}/g, e.price.toFixed(2).replace('.', ',')) // funcao para o preço

        .replace(/\${id}/g, e.id)

      // if para validar se é para ver mais ou nao no botão
      if (vermais && i >= 8 && i < 12) {
        $("#itensCardapio").append(temp)
      }
      // paginação inicial (8itens)
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp)
      }

    })

    // remover o active
    $(".container-menu a").removeClass('active');
    // reseta o menu para ativo no a que clicou
    $("#menu-" + categoria).addClass('active')

  },

  // clique no botão ver mais
  verMais: () => {

    var ativo = $(".container-menu a.active").attr('id').split('menu-')[1];
    cardapio.metodos.obterItensCardapio(ativo, true);

    $("#btnVerMais").addClass('hidden');
  },

  // manipulação de adicionar ou tirar itens
  diminuirQuantidade: (id) => {

    let qntdAtual = parseInt($("#qntd-" + id).text())

    if (qntdAtual > 0) {
      $("#qntd-" + id).text(qntdAtual - 1)
    }

  },

  aumentarQuantidade: (id) => {

    let qntdAtual = parseInt($("#qntd-" + id).text())
    $("#qntd-" + id).text(qntdAtual + 1)

  },

  // adicionar ao carrinho o item do cardápio
  adicionarAoCarrinho: (id) => {

    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {

      // obter a categoria ativa
      var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

      // obtem a lista de itens
      let filtro = MENU[categoria];

      // obtem o item
      let item = $.grep(filtro, (e, i) => { return e.id == id });

      if (item.length > 0) {

        // validar se já existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id });

        // caso já exista o item no carrinho, só altera a quantidade
        if (existe.length > 0) {
          let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
          MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
        }
        // caso ainda não exista o item no carrinho, adiciona ele
        else {
          item[0].qntd = qntdAtual;
          MEU_CARRINHO.push(item[0])
        }

        cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green')
        $("#qntd-" + id).text(0);

        cardapio.metodos.atualizarBadgeTotal();

      }

    }

  },
  // atualizar os valores do carrinho
  atualizarBadgeTotal: () => {
    var total = 0;
    $.each(MEU_CARRINHO, (i, e) => {
      total += e.qntd
    })
    if (total > 0) {
      $(".botao-carrinho").removeClass('hidden')
      $(".container-total-carrinho").removeClass('hidden')
    }
    else {
      $(".botao-carrinho").addClass('hidden')
      $(".container-total-carrinho").removeClass('hidden')
    }

    $(".badge-total-carrinho").html(total);
  },

  // abrir o carrinho
  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("#modalCarrinho").removeClass('hidden');
      cardapio.metodos.carregarCarrinho();
    }
    else {
      $("#modalCarrinho").addClass('hidden')
    }
  },

  // altera os textos e exibe os botoes da etapa do carrinho
  carregarEtapa: (etapa) => {
    if (etapa == 1) {
      $("#ldlTituloEtapa").text('Seu carrinho');
      $("#itensCarrinho").removeClass('hidden');
      $("#localEntrega").addClass('hidden');
      $("#resumoCarrinho").addClass('hidden');

      $(".etapa").removeClass('active');
      $(".etapa1").addClass('active');

      $("#btnEtapaPEdido").removeClass('hidden')
      $("#btnEtapaEndereco").addClass('hidden')
      $("#btnEtapadaResumo").addClass('hidden')
      $("#btnEVoltar").addClass('hidden')

      resumoCarrinho
    }
    if (etapa == 2) {
      $("#ldlTituloEtapa").text('Endereço de entregas');
      $("#itensCarrinho").addClass('hidden');
      $("#localEntrega").removeClass('hidden');
      $("#resumoCarrinho").addClass('hidden');

      $(".etapa").removeClass('active');
      $(".etapa1").addClass('active');
      $(".etapa2").addClass('active');

      $("#btnEtapaPEdido").addClass('hidden')
      $("#btnEtapaEndereco").removeClass('hidden')
      $("#btnEtapadaResumo").addClass('hidden')
      $("#btnEVoltar").removeClass('hidden')

    }
    if (etapa == 3) {
      $("#ldlTituloEtapa").text('Endereço de entregas');
      $("#itensCarrinho").addClass('hidden');
      $("#localEntrega").addClass('hidden');
      $("#resumoCarrinho").removeClass('hidden');

      $(".etapa").removeClass('active');
      $(".etapa1").addClass('active');
      $(".etapa2").addClass('active');
      $(".etapa3").addClass('active');

      $("#btnEtapaPEdido").addClass('hidden')
      $("#btnEtapaEndereco").addClass('hidden')
      $("#btnEtapadaResumo").removeClass('hidden')
      $("#btnEVoltar").removeClass('hidden')
    }
  },
  // botão de voltar as etapas
  voltarEtapa: () => {
    let etapa = $(".etapa.active").length;
    cardapio.metodos.carregarEtapa(etapa - 1);
  },

  // carrega a lista de itens do carrinho
  carregarCarrinho: () => {

    cardapio.metodos.carregarEtapa(1);

    if (MEU_CARRINHO.length > 0) {
      $("#itensCarrinho").html('');

      $.each(MEU_CARRINHO, (i, e) => {
        let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img) // global
          .replace(/\${name}/g, e.name)
          .replace(/\${price}/g, e.price.toFixed(2).replace('.', ',')) // funcao para o preço
          .replace(/\${id}/g, e.id)
          .replace(/\${qntd}/g, e.qntd)

        $("#itensCarrinho").append(temp);

        // ultimo item do carrinho chama essa função para atualizar os valores
        if ((i + 1) == MEU_CARRINHO.length) {
          cardapio.metodos.caregarValores();
        }

      })
    }
    else {
      $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag">&nbsp &nbsp;Seu carrinho está vazio, igual você...</i></p>');
      cardapio.metodos.caregarValores();
    }

  },

  // diminuir a qunatidade do item do carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text())

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    }
    else {
      cardapio.metodos.removerItemCarrinho(id)
    }

  },

  // aumentar a qunatidade do item do carrinho
  aumentarQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text())
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
  },

  // remova todo o item do carrinho
  removerItemCarrinho: (id) => {
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id })
    cardapio.metodos.carregarCarrinho();

    cardapio.metodos.atualizarBadgeTotal();
  },

  // metodo de atualizar o carrinho
  atualizarCarrinho: (id, qntd) => {
    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
    MEU_CARRINHO[objIndex].qntd = qntd;

    // atualiza o botao do carinho com a quantidade atualizadas
    cardapio.metodos.atualizarBadgeTotal();

    // atualiza os valores totais dos carrinhos
    cardapio.metodos.caregarValores()

  },

  // vai carregar os depoimentos
  abrirDepoimento: (depoimento) => {
    $('#depoimento-1').addClass('hidden');
    $('#depoimento-2').addClass('hidden');
    $('#depoimento-3').addClass('hidden');

    $('#btnDepoimento-1').removeClass('active');
    $('#btnDepoimento-2').removeClass('active');
    $('#btnDepoimento-3').removeClass('active');

    $('#depoimento-' + depoimento).removeClass('hidden');
    $('#btnDepoimento-' + depoimento).addClass('active');
  },

  // carrega os valores de Subtotal, entrega e Total
  caregarValores: () => {
    VALOR_CARRINHO = 0;

    $("#lblSubTotal").text(('R$ 0,00'));
    $("#idlValorEntrega").text(('+ R$ 0,00'));
    $("#ldlValorTotal").text(('R$ 0,00'));

    $.each(MEU_CARRINHO, (i, e) => {
      VALOR_CARRINHO += parseFloat(e.price * e.qntd);

      if ((i + 1) == MEU_CARRINHO.length) {
        $("#lblSubTotal").text((`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`));
        $("#idlValorEntrega").text((`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`));
        $("#ldlValorTotal").text((`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`));
      }
    })
  },

  // carregar a etapa dos endereços
  carregarEnedreco: () => {
    if (MEU_CARRINHO.length <= 0) {
      cardapio.metodos.mensagem('Seu carrinho está vazio')
      return;
    }

    cardapio.metodos.carregarEtapa(2);
  },

  // api ViaCep
  buscarCep: () => {
    // variavel com o valor do cep
    var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

    // verifica se o cep tem valor
    if (cep != "") {

      // para validar o cepp cpm 9 digitos  https://viacep.com.br/ws/88062400/json?callback=?
      var validacep = /^[0-9]{8}$/;

      if (validacep.test(cep)) {

        $.getJSON("https://viacep.com.br/ws/" + cep + "/json?callback=?", function (dados) {
          if (!("erro" in dados)) {
            // atualizar os campos com os valores retornados
            $("#txtEndereco").val(dados.logradouro);
            $("#txtBairro").val(dados.bairro);
            $("#txtCidade").val(dados.localidade);
            $("#txtUF").val(dados.uf);
            $("#txtNumero").focus();
          }
          else {
            cardapio.metodos.mensagem("CEP não encontrado. Preencha as informações manualmente ");
            $("txtEndereco").focus();
          }
        })

      }
      else {
        cardapio.metodos.mensagem("Formato do CEP é inválido ");
        $("txtCEP").focus();
      }

    }
    else {
      cardapio.metodos.mensagem("Informe o CEP, por favor.")
      $("#txtCEP").focus();
    }
  },

  // validação antes de proceguir com para a etapa(3)
  resumoPedido: () => {
    let cep = $("#txtCEP").val().trim();
    let endereco = $("#txtEndereco").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let cidade = $("#txtCidade").val().trim();
    let uf = $("#txtUF").val().trim();
    let numero = $("#txtNumero").val().trim();
    let complemento = $("#txtComplemento").val().trim();

    if (cep.length <= 0) {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
      return;
    }

    if (endereco.length <= 0) {
      cardapio.metodos.mensagem("Informe o Endereço, por favor.");
      $("#txtEndereco").focus();
      return;
    }

    if (bairro.length <= 0) {
      cardapio.metodos.mensagem("Informe o Bairro, por favor.");
      $("#txtBairro").focus();
      return;
    }

    if (cidade.length <= 0) {
      cardapio.metodos.mensagem("Informe a Cidade, por favor.");
      $("#txtCidade").focus();
      return;
    }

    if (uf == "-1") {
      cardapio.metodos.mensagem("Informe a UF, por favor.");
      $("#txtUF").focus();
      return;
    }

    if (numero.length <= 0) {
      cardapio.metodos.mensagem("Informe o Numero, por favor.");
      $("#txtNumero").focus();
      return;
    }

    MEU_ENDERECO = {
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      bairro: bairro,
      cidade: cidade,
      uf: uf,
      numero: numero,
      complemento: complemento,
    }

    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo();

  },

  // carrega a etapa de resumo do pedido
  carregarResumo: () => {
    $("#listaItensResumo").html('');

    $.each(MEU_CARRINHO, (i, e) => {
      let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img) // global
        .replace(/\${name}/g, e.name)
        .replace(/\${price}/g, e.price.toFixed(2).replace('.', ',')) // funcao para o preço
        .replace(/\${qntd}/g, e.qntd)

      $("#listaItensResumo").append(temp);
    });

    $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro} `)
    $("#cidadendereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`)

    cardapio.metodos.finalizarPedido();
  },

  // atualiza o link do botao do whatsapp
  finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

      var texto = 'Olá gostaria de fazer um pedido:';
      texto += `\n*Itens do pedido:*\n\n\${itens}`;
      texto += '\n*Endereço de entrega:*';
      texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro} `;
      texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
      texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;

      var itens = '';

      $.each(MEU_CARRINHO, (i, e) => {
        itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;

        // ultimo itens, ai ele atualiza o texto
        if ((i + 1) == MEU_CARRINHO.length) {
          texto = texto.replace(/\${itens}/g, itens);

          // converte a url pra deixar ela legível
          let encode = encodeURI(texto);
          let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

          $("#btnEtapadaResumo").attr('href', URL);
        }
      })
    }
  },

  // carrega o linkl do botao de reserva
  carregarBotaoReserva: () => {
    var texto = `Olá! gostaria de fazer uma *reserva* `

    let encode = encodeURI(texto)
    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

    $('#btnReserva').attr('href', URL);
  },

  // carrega o botao de ligar
  carregraBotaoLigar: () => {
    $('#btnLigar').attr('href', `tel:${CELULAR_EMPRESA}`);
  },

  // carrega o link do whatsapp
  carregarConversaWhastapp: () => {
    var texto = `Olá! este é meu contato pessoal, em que posso te ajudar?`;

    let encode2 = encodeURI(texto)
    let URL = `https://wa.me/${CELULAR_PESSOAL}?text=${encode2}`;

    $('#btnLigarPessoal').attr('href', URL);
  },

  // mensagens

  mensagem: (texto, cor = 'red', tempo = 3500) => {

    // pego um numero aleatorio e multiplico ele pela data atual
    let id = Math.floor(Date.now() * Math.random()).toString()

    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`

    $("#container-mensagens").append(msg);

    setTimeout(() => {
      $("#msg-" + id).removeClass('fadeInDown');
      $("#msg-" + id).addClass('fadeOutUp');
      setTimeout(() => {
        $("msg-" + id).remove();
      }, 800);
    }, tempo)

  }
};

cardapio.templates = {

  item: `
  <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5">
    <div class="card card-item wow fadeIn delay-02s" id="\${id}">
      <div class="img-produto wow fadeInUp delay-01s">
        <img src="\${img}"/>
      </div>
      <p
        class="title-produto text-center mt-4 wow fadeInUp delay-02s"
        onmouseover="expandText(this)"
        onmouseout="truncateText(this)"
      >
        <b>\${name}</b>
      </p>
      <p class="price-produto text-center wow fadeInUp delay-01s">
        <b>R$ \${price}</b>
      </p>
      <div class="add-carrinho">
        <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
        <span class="add-numero-itens" id="qntd-\${id}">0</span>
        <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
        <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
      </div>
    </div>
  </div>

  `,

  itemCarrinho: `
  <div class="col-12 item-carrinho">
  <div class="img-produto">
    <img src="\${img}"/>
  </div>
  <div class="dados-produto">
    <p class="title-produto"><b>\${name}</b></p>
    <p class="price-produto"><b>R$ \${price}</b></p>
  </div>
  <div class="add-carrinho">
    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
    <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
    <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>
  </div>
</div>
  `,

  itemResumo: `
  <div class="col-12 item-carrinho resumo">
  <div class="img-produto-resumo">
    <img
      src="\${img}"
    />
  </div>
  <div class="dados-produto">
    <p class="title-produto-resumo">
      <b>\${name}</b>
    </p>
    <p class="price-produto-resumo">
      <b>R$ \${price}</b>
    </p>
  </div>
  <p class="quantidade-produto-resuno">x <b>\${qntd}</b></p>
</div>
  `

};
console.log(CELULAR_EMPRESA)
console.log(CELULAR_PESSOAL)
